$(document).ready(function(){
  $.getJSON('https://galvanize-eats-api.herokuapp.com/menu', function(response){
      console.log(response);

      _.sortBy(response.menu, "type").forEach(function(val, key){
        var option = $('<option>', {html:val.name + val.price})
        console.log("option");
        $('#menuMultiselect').append(option)
      })
  })
})
