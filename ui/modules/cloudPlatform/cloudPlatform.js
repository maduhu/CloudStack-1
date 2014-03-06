(function($, cloudStack) {
  //
  // Remove unsupported items from UI
  //
  var removeUnsupported = function() {
    var removeSelectOptions = function (ids, $select) {
      $select.live('mousedown', function () {
        $(this).find('option').each(function () {
          var val = $(this).val();

          if ($.inArray(val, ids) > -1) {
            $(this).remove();
          }
        });
      });
    };

    var removeFormFields = function (ids) {
      $(window).bind('cloudStack.createForm.open', function (e, data) {
        data.$form.find('.form-item').filter(function() {
          return $.inArray($(this).attr('rel'), ids) > -1;
        }).remove();
      });
    };

    // Make XenServer default option in hypervisor fields
    $(window).bind('cloudStack.createForm.makeFields', function (e, data) {
      if (data.fields.hypervisor) {
        data.fields.hypervisor.defaultValue = 'XenServer';
      }
    });

    // Filter out unsupported network service providers
    var unsupportedProviders = ['MidoNet', 'BigSwitch Vns', 'BigSwitchVns'];
    $('.list-view').live('cloudStack.listView.addRow', function(e, data) {
      var $tr = data.$tr;

      if ($.inArray($tr.find('td.name span').html(), unsupportedProviders) > -1) {
        $tr.remove();
      }
    });
    removeSelectOptions(unsupportedProviders, $('.dynamic-input, form select'));

    // Zone wizard: Physical network: Remove unsupported isolation methods
    removeSelectOptions(['GRE', 'VNS', 'SSP'], $('.zone-wizard .setup-physical-network .input-area select'));

    // Remove unsupported hypervisors
    removeSelectOptions(['LXC', 'OVM', 'Ovm'], $('form select[name=hypervisor]'));

    // Remove unsupported secondary storage provider types
    removeSelectOptions(['Swift'], $('form select[name=provider]'));

    removeFormFields(['diskBytesReadRate', 'diskBytesWriteRate', 'diskIopsReadRate', 'diskIopsWriteRate']);
    removeFormFields(['isCustomizedIops', 'minIops', 'maxIops']);
  };

  cloudStack.modules.cloudPlatform = function(module) {
    // Only these languages will show in login lang selection
    var supportedLanguages = [
      'en', 'en-US', 'ja', 'ja_JP', 'zh_CN'
    ];

    var replace = function(str) {
      var cpStr = 'CloudPlatform™';

      return str
        .replace(/\&\#8482/g, '') // Remove tm symbol
        .replace(/CloudStack/gi, cpStr);
    };

    var eula = function(args) {
      var $eula = $('<div>').addClass('eula');
      var $eulaContainer = $('<div>').addClass('eula-container');
      var $agreeButton = $('<div>').addClass('button agree').html('Agree');
      var complete = args.complete;

        $eulaContainer.append(
            $('<iframe>').attr({ src: 'modules/cloudPlatform/eula.' + g_lang + '.html' })
        );

      $agreeButton.click(complete);
      $eula.append($eulaContainer, $agreeButton);

      return $eula;
    };

    var resizeLoginFooter = function() {
      var $footer = $('.login .footer');

      $footer.width($(window).width());
      $footer.css({
        top: $(window).height() - 250
      });
    };

    var $loginFooter = $('<div>').addClass('footer');

    $(window).resize(function() {
      resizeLoginFooter();
    });

    $('#template .login').append($loginFooter);
    resizeLoginFooter();

    $(window).bind('cloudStack.init', function() {
      $('#template').html(
        replace($('#template').html())
      );

      // Update logos
      $(window).bind('cloudStack.ready', function() {
        $('#header .controls').append($('<div>').attr('id', 'citrix-logo'));

        // Change help link
        var $link = $('#user-options a.help');

        $link.unbind('click').bind('click', function() {
          var helpURL = 'http://support.citrix.com/proddocs/topic/cloudplatform/clst-wrapper.html';

          window.open(helpURL, '_blank');

          return false;
        });
      });

      // Add EULA to install process
      cloudStack.preInstall = eula;

      // Replace 'CloudStack' -> 'CloudPlatform'
      cloudStack.localizationFn = function(str) {
        return dictionary[str] ? replace(dictionary[str]) : str;
      };

      // Remove unsupported languages
      $('div.login .select-language select option').each(function() {
        var $option = $(this);

        if ($option.val() && $.inArray($option.val(), supportedLanguages) == -1) {
          $option.remove();
        }
      });

      // If browser is using non-supported language, fallback to English
      if (!$.cookie('lang') && $.inArray(navigator.language, supportedLanguages) == -1) {
        $.cookie('lang', 'en');
        window.g_lang='en';
      }

      removeUnsupported();
    });
  };
}(jQuery, cloudStack));