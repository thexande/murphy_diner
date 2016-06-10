$(document).ready(function(){
  $.getJSON('https://galvanize-eats-api.herokuapp.com/menu', function(response){
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
          var spaceDiff = 55 - (parseInt(val.name.length)
            + parseInt(val.price.toString().length));
          optGroupBurger.append($('<option>',
            {html:val.name + spaceReturn(spaceDiff, val.price) + val.price}))
        } else if(val.type === 'pizza'){
          var spaceDiff = 55 - (parseInt(val.name.length)
            + parseInt(val.price.toString().length));
          optGroupPizza.append($('<option>',
            {html:val.name + spaceReturn(spaceDiff, val.price) + val.price}))
        }
      })
      $('#menuMultiselect').append(optGroupPizza, optGroupBurger)
  })
  $("#customerInfo").submit(function(e){
      console.log("submit");

      var data = JSON.stringify($(this).serializeArray())
      console.log(data);

  })
  $('#addItemsToCart').click(function(click){
    var selected = $('#menuMultiselect').val()
    console.log(selected);
  })
})
