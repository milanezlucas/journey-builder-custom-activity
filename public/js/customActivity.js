'use strict';

define(function (require) {
    var Postmonger = require('postmonger');
    var connection = new Postmonger.Session();

    var payload = {};
    var authTokens = {};

    var eventDefinitionKey = null;
    var callMeOrigin = null;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', requestedInteractionHandler);
    connection.on('clickedNext', save);

    /* [ Form Validate ] ================================================================== */

    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function showValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }

    function validate_field(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if ($(input).val().trim() == '' || $(input).val().trim() == 'conta de envio*') {
                return false;
            }
        }
    }

    function validate() {
        var input = $('.validate-input .input100');
        var check = true;
        for (var i = 0; i < input.length; i++) {
            if (validate_field(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }
        return check;
    }

    /* ![ Form Validate ] ================================================================== */

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');

        $('#toggleActive').click(function (evt) {
            evt.preventDefault();

            if (validate()) {
                document.getElementById('callMeOrigin').disabled = true;
                callMeOrigin = $('#callMeOrigin').val();

                document.getElementById('toggleActive').disabled = true;
                document.getElementById('toggleActive').innerHTML = "Ativado";
            }
        });
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        // console.log('initialize', JSON.stringify(payload));
        callMeOrigin = payload.arguments.execute.inArguments[0].callMeOrigin;

        if (callMeOrigin) {
            document.getElementById('callMeOrigin').disabled = true;
            document.getElementById('callMeOrigin').value = callMeOrigin;

            document.getElementById('toggleActive').disabled = true;
            document.getElementById('toggleActive').innerHTML = "Ativado";
        }
    }

    function onGetTokens(tokens) {
        // console.log(tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        // console.log('onGetEndpoints', endpoints);
    }

    function requestedInteractionHandler(settings) {
        try {
            eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
            $('#select-entryevent-defkey').val(eventDefinitionKey);
        } catch (err) {
            console.error(err);
        }
    }

    function save() {
        payload['arguments'].execute.inArguments = [{
            // "tokens": authTokens,
            "callMeOrigin": callMeOrigin,
            "contactIdentifier": "{{Contact.Key}}",
            'nome': '{{Event.' + eventDefinitionKey + '.nome}}',
            "email": '{{Event.' + eventDefinitionKey + '.email}}',
            "telefone": '{{Event.' + eventDefinitionKey + '.telefone}}'
        }];

        payload['metaData'].isConfigured = true;

        // console.log('payload', JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }
});