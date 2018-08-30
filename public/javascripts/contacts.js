
$(function() {
  let contactList;
  let $contactsUL = $('.contacts-list');
  let $noContactsBox = $('.zero-contacts');
  let $formBox = $('.form-box');
  let $search = $('#search-input');

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


  function showMain() {
    $formBox.slideUp();
    $('.search-add-bar').slideDown();
    $('.main-panel').slideDown();
    $formBox.empty();
  }

  function showForm(markup) {
    $formBox.html(markup);
    $('.search-add-bar').slideUp();
    $('.main-panel').slideUp();
    $('.message').slideUp();
    $formBox.slideDown();
  }

  function drawContactsList(jsonObj) {
    let contactsHTML = contactsListScript({contacts: jsonObj });

    if (jsonObj.length > 0) {
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
        contactList = json;
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
        showMain();
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
        showMain();
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
    showForm(addContactTemplate);
  });

  $search.on('keyup', function(e) {
    let searchString = $search.val();
    let matchingContacts = searchContacts(searchString, contactList);

    if (matchingContacts.length > 0) {
      drawContactsList(matchingContacts);
    } else {
      $('#search-display > span').text(searchString);
    }

  });

  $formBox.on('submit', '#add', function (e) {
    e.preventDefault();
    let  data = $(this).serializeArray();
    let jsonReady = processFormData(data);

    addContact(jsonReady); 
  });


  $formBox.on('submit', '#edit-form', function (e) {
    e.preventDefault();
    let id = $(this).attr('data-contact');
    let  data = $(this).serializeArray();
    let jsonReady = processFormData(data);
    
    editContact(jsonReady, id);
  });

  $formBox.on('click', '#cancel', function(e) {
    e.preventDefault();
    showMain();
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
    showForm(editHTML);
  });

});

