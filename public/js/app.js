$(document).ready(function(){
  $('.alert-danger').hide()
  $('.alert-success').hide()
  var itemsOrdered = {data:[], totals:{sub:0, grand:0, items:0, tax:0}}
  var itemsFromAPI
  // hide any error modals
  $('#itemQuantity, #addItemsToCart, #menuMultiselect').click(function(){
    $('.alert-danger').hide()
  })
  function showIssue(issue){
    $('.alert-danger').html('  <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> '+issue)
    $('.alert-danger').show()
  }

  function sendPost(data){
    return $.ajax({
      method: "POST",
      url: "https://galvanize-eats-api.herokuapp.com/orders",
      data: data,
    })
  }
  function calcTotals(){
    itemsOrdered.totals.sub   = 0
    itemsOrdered.totals.items = 0
    itemsOrdered.totals.tax   = 0
    itemsOrdered.totals.grand = 0
    itemsOrdered.data.forEach(function(val, key){
      if(val.qty != 0){
        for (var i = 0; i < val.qty; i++) {
          itemsOrdered.totals.sub += val.price
          itemsOrdered.totals.items++
        }
      } else {
        itemsOrdered.totals.sub += val.price
        itemsOrdered.totals.items += val.qty
      }
    })
    itemsOrdered.totals.tax = (itemsOrdered.totals.sub * .083)
    itemsOrdered.totals.grand = itemsOrdered.totals.sub + itemsOrdered.totals.tax
    $('#subtotal').html(itemsOrdered.totals.sub.toFixed(2))
    $('#tax').html(itemsOrdered.totals.tax.toFixed(2))
    $('#total_items').html(itemsOrdered.totals.items)
    $('#grand_total').html(itemsOrdered.totals.grand.toFixed(2))
  }
  $.getJSON('https://galvanize-eats-api.herokuapp.com/menu', function(response){
      itemsFromAPI = response
      var optGroupPizza = $("<optgroup>", {label:'Pizzas'})
      var optGroupBurger = $("<optgroup>", {label:'Burgers'})
      var spaceReturn = function(length, price){
        price.toString().split('.')[0].length === 1 ? length += 2 : null
        var spaceString = ''
        for (var i = 0; i < length; i++) {
            spaceString += '&nbsp'
        } return spaceString;
      }
      _.sortBy(response.menu, "type").forEach(function(val, key){
        if(val.type === 'burger'){
          var spaceDiff = 65 - (parseInt(val.name.length)
            + parseInt(val.price.toString().length));
          optGroupBurger.append($('<option>',
            {value:val.id, html:val.name + spaceReturn(spaceDiff, val.price) + val.price}))
        } else if(val.type === 'pizza'){
          var spaceDiff = 65 - (parseInt(val.name.length)
            + parseInt(val.price.toString().length));
          optGroupPizza.append($('<option>',
            {value:val.id, html:val.name + spaceReturn(spaceDiff, val.price) + val.price}))
        }
      })
      $('#menuMultiselect').append(optGroupPizza, optGroupBurger)
  })
  $("#customerInfo").submit(function(e){
      event.preventDefault()
      console.log("submit");
      var data = $(this).serializeArray()
      var postObj = {formData: data, cartData: itemsOrdered};
      $('#jsonContainer').html(JSON.stringify(postObj, null, 2))
      $('#jsonInfoModal').modal()
      sendPost(postObj).done(function(data){
        console.log(data);
        $('.alert-success').show();
      });
  })
  $('#addItemsToCart').click(function(click){
    // any items selected? or qty?
    if(parseInt($('#itemQuantity').val()) <= 0){showIssue("Please enter a quantity larger than zero."); return}
    if(!$('#menuMultiselect').val()){showIssue("Please select at least 1 item."); return}
    if(!$('#itemQuantity').val()){showIssue("Please enter a valid Quantity."); return}
    // get our items selected and add them to our order obj
    $('#menuMultiselect').val().forEach(function(val, key, arr){
      var item = itemsFromAPI.menu[parseInt(val - 1)]
      // does our object exist in our arr? add qty etc.
      if(itemsOrdered.data.indexOf(item) != -1){
        itemsOrdered.data.filter((a) => {return a['id']===item.id})[0].qty
          += parseInt($('#itemQuantity').val())
        calcTotals()
      } else {
        itemsOrdered.data.push(item)
        item['qty'] = parseInt($('#itemQuantity').val())
        calcTotals()
      }
    })
    // reload data table
    var table = $('#itemsOrderedTable').dataTable().api()
    table.clear()
    table.rows.add(itemsOrdered.data)
    table.draw()
  })
  $('#itemsOrderedTable').DataTable({
    "language": {
      "emptyTable": "Add some items to your order!"
    },
    searching: false,
    ordering: false,
    paging: false,
    info: false,
    "aaData": itemsOrdered.data,
    "aoColumns": [
      { "title": 'Qty', "mDataProp": "qty" },
      { "title": "Food Item", "mDataProp": "name" },
      { "title": "price", "mDataProp": "price" },
      { "title": "type", "mDataProp": "type" }
    ]
  })
})
