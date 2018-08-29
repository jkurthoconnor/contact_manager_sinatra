
$(function() {
  let contactList
  let $contactsUL = $('.contacts-list');
  let $noContactsBox = $('.zero-contacts');

  let contactsTemplate = $('#contacts-li').html();
  let contactsListScript = Handlebars.compile(contactsTemplate);

  getContacts();

  function processFormData(serializedArray) {
    let formDataObj = {};

    serializedArray.forEach(function(field) {
      formDataObj[field.name] = field.value;
    });

    return formDataObj;
  }


  function drawContactsList(jsonObj) {
    let contactList = jsonObj;
    let contactsHTML = contactsListScript({contacts: contactList });

    if (contactList.length > 0) {
      $contactsUL.append(contactsHTML).show();
      $noContactsBox.hide();
    }
  }

  function getContacts() {
    $.ajax({
      url: 'http://localhost:4567/api/contacts', 
      type: 'GET',
      dataType: 'json',
      success: function(json) {
        drawContactsList(json);
      }
    });
  }

  function addContact(formObj) {
    $.ajax({
      url: 'http://localhost:4567/api/contacts', 
      data: formObj,
      type: 'POST',
      dataType: 'json',
    });
  }

  function searchContacts(searchStr, contactList) {
    let pattern = new RegExp('^' + searchStr, 'i');

    return contactList.filter(function(contact) {
      return contact.full_name.split(/\s+/).some(function(namePart) {
        return namePart.match(pattern);
      });
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

  function deleteContact(id) {
    $.ajax({
      url: `http://localhost:4567/api/contacts/${id}`,
      type: 'DELETE',
      dataType: 'json',
    });
  }

  $('.search-add-bar > a').on('click', function(e) {
    $('.search-add-bar').slideUp();
    $('.main-panel').slideUp();
    $('.message').slideUp();
    $('.form-box').slideDown();
     


  });

  $('form').on('submit', function (e) {
    e.preventDefault();
    let  data = $(this).serializeArray();
    let jsonReady = processFormData(data);
    addContact(jsonReady); 
    getContacts();
  });
});

