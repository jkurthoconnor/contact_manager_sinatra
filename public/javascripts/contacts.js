
$(function() {
  let contactList;
  let $contactsUL = $('.contacts-list');
  let $noContactsBox = $('.zero-contacts');
  let $editContactBox = $('.form-box');

  let contactsTemplate = $('#contacts-li').html();
  let contactsListScript = Handlebars.compile(contactsTemplate);

  let addContactTemplate = $('#add-contact-form').html();

  let editContactTemplate = $('#edit-contact-form').html();
  let editContactScript = Handlebars.compile(editContactTemplate);

  getContacts();

  function processFormData(serializedArray) {
    let formDataObj = {};

    serializedArray.forEach(function(field) {
      formDataObj[field.name] = field.value;
    });

    return formDataObj;
  }


  function drawContactsList(jsonObj) {
    contactList = jsonObj;
    let contactsHTML = contactsListScript({contacts: contactList });

    if (contactList.length > 0) {
      $contactsUL.html(contactsHTML).show();
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
      success: function() {
        getContacts();
        $('.form-box').slideUp();
        $('.search-add-bar').slideDown();
        $('.main-panel').slideDown();
        $('.form-box').empty();
      },
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
        getContacts();
        $('.form-box').slideUp();
        $('.search-add-bar').slideDown();
        $('.main-panel').slideDown();
        $('.form-box').empty();
      }
    });
  }

  function deleteContact(id) {
    $.ajax({
      url: `http://localhost:4567/api/contacts/${id}`,
      type: 'DELETE',
      dataType: 'json',
      success: function() {
        getContacts();
      }
    });
  }

  $('.search-add-bar > a').on('click', function(e) {
    console.log(addContactTemplate);  
    $('.form-box').html(addContactTemplate);
    $('.search-add-bar').slideUp();
    $('.main-panel').slideUp();
    $('.message').slideUp();
    $('.form-box').slideDown();
  });

  $('.form-box').on('submit', '#add', function (e) {
    e.preventDefault();
    let  data = $(this).serializeArray();
    let jsonReady = processFormData(data);

    addContact(jsonReady); 
  });


  $('.form-box').on('submit', '#edit-form', function (e) {
    e.preventDefault();
    let id = $(this).attr('data-contact');
    let  data = $(this).serializeArray();
    let jsonReady = processFormData(data);
    
    editContact(jsonReady, id);
  });

  $('.contacts-list').on('click', 'a[data-role="delete"]', function(e) {
    e.preventDefault();
    let id = $(this).attr('data-contact');

    deleteContact(id);
  });

  $('.contacts-list').on('click', 'a[data-role="edit"]', function(e) {
    e.preventDefault();
    let id = $(this).attr('data-contact');
    let contact =  contactList.filter(function(contact) {
      return contact.id === Number(id);
    })[0];

    let editHTML = editContactScript(contact); 
    $editContactBox.html(editHTML);

    $('.search-add-bar').slideUp(); // extract: also used for show add contact
    $('.main-panel').slideUp();     //
    $('.message').slideUp();        //
    $('.form-box').slideDown(); // unique; provide `down` argument
  });


});

