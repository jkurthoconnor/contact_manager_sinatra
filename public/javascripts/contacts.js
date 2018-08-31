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

  let tagsListTemplate = $('#tag-filters').html();
  let tagsListScript = Handlebars.compile(tagsListTemplate);

  const api = {
    getContacts: function() {
      $.ajax({
        url: 'http://localhost:4567/api/contacts', 
        type: 'GET',
        dataType: 'json',
        success: function(json) {
          helpers.splitTags(json);
          contactList = json;
          ui.drawContactsList(json);
          ui.drawTagsList(helpers.collectUniqueTags(json));
        }
      });
    },

    addContact: function(formObj) {
      let self = this;

      $.ajax({
        url: 'http://localhost:4567/api/contacts', 
        data: formObj,
        type: 'POST',
        dataType: 'json',
        success: function() {
          self.getContacts();
          ui.showMain();
        },
      });
    },

    editContact: function(formObj, id) {
      let self = this;

      $.ajax({
        url: `http://localhost:4567/api/contacts/${id}`,
        data: formObj,
        type: 'PUT',
        dataType: 'json',
        success: function(json) {
          self.getContacts();
          ui.showMain();
        }
      });
    },

    deleteContact: function(id) {
      let self = this;

      $.ajax({
        url: `http://localhost:4567/api/contacts/${id}`,
        type: 'DELETE',
        dataType: 'json',
        success: function() {
          self.getContacts();
        }
      });
    },
  };


  const helpers = {
    processFormData: function(serializedArray) {
      let formDataObj = {};

      serializedArray.forEach(function(field) {
        formDataObj[field.name] = field.value;
      });

      return formDataObj;
    },

    splitTags: function(contactsJson) {
      contactsJson.forEach(function(contact, idx, arr) {
        if (contact.tags) {
          arr[idx].tags = contact.tags.split(',');
        }
      });
    },

    collectUniqueTags: function(contacts) { // hook for tag display
      let uniqueTags = [];

      contacts.forEach(function(contact) {
        if (contact.tags) {
          contact.tags.forEach(function(tag) {
            if (!uniqueTags.includes(tag)) {
              uniqueTags.push(tag);
            }
          });
        }
      });

      return uniqueTags;
    },

    searchTags: function(selectedTags, contacts) {
      return contacts.filter(function(contact) {
        if (contact.tags) {
          return contact.tags.some(function(tag) {
           return selectedTags.includes(tag)
          });
        }
      })
    },

    searchNames: function(searchStr, contacts) {
      let pattern = new RegExp('^' + searchStr, 'i');

      return contacts.filter(function(contact) {
        return contact.full_name.split(/\s+/).some(function(namePart) {
          return namePart.match(pattern);
        });
      });
    },
  };

  const ui = {
    showMain: function() {
      $formBox.slideUp();
      $('#search-bar').slideDown();
      $('.main-panel').slideDown();
      $formBox.empty();
    },

    showForm: function(markup) {
      $formBox.html(markup);
      $('#search-bar').slideUp();
      $('.main-panel').slideUp();
      $('.message').slideUp();
      $formBox.slideDown();
    },

    showMessage: function() {
      $contactsUL.slideUp();
      $('.message').show();
    },

    hideMessage: function() {
      $('.message').hide();
    },

    drawTagsList: function(tagsArr) {
      let tagsHTML = tagsListScript({tags: tagsArr});
      $('#tag-list').html(tagsHTML);
    },


    drawContactsList: function(jsonObj) {
      let contactsHTML = contactsListScript({contacts: jsonObj });

      if (jsonObj.length > 0) {
        $contactsUL.html(contactsHTML).show();
        $noContactsBox.hide();
      } else {
        $contactsUL.hide();
        $noContactsBox.show();
      }
    },
  };

  api.getContacts();

  $('.add-contact-button').on('click', function(e) {
    ui.showForm(addContactTemplate);
  });

  $search.on('keyup', function(e) {
    let searchString = $search.val();
    let matchingContacts = helpers.searchNames(searchString, contactList);

    ui.hideMessage();

    if (matchingContacts.length > 0) {
      ui.drawContactsList(matchingContacts);
    } else {
      $('#search-display > span').text(searchString);
      ui.showMessage();
    }
  });

  $formBox.on('submit', '#add', function (e) {
    e.preventDefault();
    let $nameField =  $('input[name="full_name"]');

    if (!$nameField[0].validity.valid) {
      $('dd.error-message').show();
      $nameField.addClass('error-message');
      return;
    } else {
      let data = $(this).serializeArray();
      let jsonReady = helpers.processFormData(data);

      $nameField.removeClass('error-message');
      api.addContact(jsonReady); 
    }
  });

  $('#tag-list').on('change', 'form', function(e) {
    e.preventDefault();

    let tags = [];
    let matchingContacts;

    $('#tag-list input:checked').each(function() {
      tags.push($(this).attr('data-tag'));
    });

    matchingContacts = helpers.searchTags(tags, contactList);
    ui.drawContactsList(matchingContacts);
  });

  $contactsUL.on('click', 'a[data-tag]', function(e) {
    e.preventDefault();
    let tag = $(this).attr('data-tag');
    let matchingContacts = helpers.searchTags([tag], contactList);

    console.log(helpers.collectUniqueTags(contactList));
    ui.hideMessage();
    ui.drawContactsList(matchingContacts);
  });

  $formBox.on('submit', '#edit-form', function (e) {
    e.preventDefault();
    let id = $(this).attr('data-contact');
    let  data = $(this).serializeArray();
    let jsonReady = helpers.processFormData(data);
    
    api.editContact(jsonReady, id);
  });

  $formBox.on('click', '#cancel', function(e) {
    e.preventDefault();
    ui.showMain();
  });

  $contactsUL.on('click', 'a[data-role="delete"]', function(e) {
    e.preventDefault();
    let id = $(this).attr('data-contact');

    if (window.confirm('Do you want to delete this contact?')) {
      api.deleteContact(id);
    }
  });

  $contactsUL.on('click', 'a[data-role="edit"]', function(e) {
    e.preventDefault();
    let id = $(this).attr('data-contact');
    let contact =  contactList.filter(function(contact) {
      return contact.id === Number(id);
    })[0];

    let editHTML = editContactScript(contact);
    ui.showForm(editHTML);
  });
});

