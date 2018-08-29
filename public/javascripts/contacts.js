
$(function() {

  function processFormData(serializedArray) {
    let formDataObj = {};

    serializedArray.forEach(function(field) {
      formDataObj[field.name] = field.value;
    });

    return formDataObj;
  }


  function getContacts() {
    $.ajax({
      url: 'http://localhost:4567/api/contacts', 
      type: 'GET',
      dataType: 'json',
      success: function(json) {
        console.log(json); // save json return in a variable
      }
    });
  }

  function addContact(formObj) {

    $.ajax({
      url: 'http://localhost:4567/api/contacts', 
      data: formObj,
      type: 'POST',
      dataType: 'json',
      success: function(json) {
        console.log(json);
      }
    });
  }

    function searchContacts(searchStr, contactList) {
      let pattern = new RegExp('^' + searchStr, 'i');

      return contactList.filter(function(contact) {
        return contact.full_name.match(pattern);
      });
    }
   
  function editContact(formObj, id) {

    $.ajax({
      url: `http://localhost:4567/api/contacts/${id}`,
      data: formObj,
      type: 'PUT',
      dataType: 'json',
      success: function(json) {
        console.log(json);
      }
    });
  }

  $('form').on('submit', function (e) {
    e.preventDefault();
    let  data = $(this).serializeArray();
    let jsonReady = processFormData(data);
    addContact(jsonReady); 
  });


});

