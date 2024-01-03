
/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

MODE_LIST = null

$(function() {
  $(".modeAttr, .expressionAttr").on('change', function() {
    modifyWithoutSave = true
  })
})

$('#bt_addMode').off('click').on('click', function() {
  bootbox.prompt('{{Nom du mode}}' + ' ?', function(result) {
    if (result !== null && result != '') {
      addMode({ name: result })
      modifyWithoutSave = true
    }
  })
})

$('.eqLogic').off('click', '.rename').on('click', '.rename', function() {
  var el = $(this)
  bootbox.prompt('{{Nouveau nom du mode}}' + ' ?', function(result) {
    if (result !== null && result != '') {
      let mode = el.closest('.mode')
      let previousName = el.text()
      let title = mode.find('span.name').html().replace(previousName, result)
      el.text(result)
      mode.find('span.name').html(title)
      updateSelectMode({ [previousName]: result })
      modifyWithoutSave = true
    }
  })
})

$("body").off('click', '.listCmdAction').on('click', '.listCmdAction', function() {
  var type = $(this).attr('data-type')
  var el = $(this).closest('.' + type).find('.expressionAttr[data-l1key=cmd]')
  jeedom.cmd.getSelectModal({ cmd: { type: 'action' } }, function(result) {
    el.value(result.human)
    jeedom.cmd.displayActionOption(el.value(), '', function(html) {
      el.closest('.' + type).find('.actionOptions').html(html)
      jeedomUtils.taAutosize()
    })
  })
})

$("body").off('click', '.listAction').on('click', '.listAction', function() {
  var type = $(this).attr('data-type')
  var el = $(this).closest('.' + type).find('.expressionAttr[data-l1key=cmd]')
  jeedom.getSelectActionModal({}, function(result) {
    el.value(result.human)
    jeedom.cmd.displayActionOption(el.value(), '', function(html) {
      el.closest('.' + type).find('.actionOptions').html(html)
      jeedomUtils.taAutosize()
    })
  })
})

$("body").off('click', '.bt_removeAction').on('click', '.bt_removeAction', function() {
  var type = $(this).attr('data-type')
  $(this).closest('.' + type).remove()
  modifyWithoutSave = true
})

$("#div_modes").off('click', '.bt_addInAction').on('click', '.bt_addInAction', function() {
  addAction({}, 'inAction', $(this).closest('.mode'))
  modifyWithoutSave = true
})

$("#div_modes").off('click', '.bt_addOutAction').on('click', '.bt_addOutAction', function() {
  addAction({}, 'outAction', $(this).closest('.mode'))
  modifyWithoutSave = true
})

$('.eqLogic').off('focusout', '.cmdAction.expressionAttr[data-l1key=cmd]').on('focusout', '.cmdAction.expressionAttr[data-l1key=cmd]', function(event) {
  var type = $(this).attr('data-type')
  var expression = $(this).closest('.' + type).getValues('.expressionAttr')
  var el = $(this)
  jeedom.cmd.displayActionOption($(this).value(), init(expression[0].options), function(html) {
    el.closest('.' + type).find('.actionOptions').html(html)
    jeedomUtils.taAutosize()
  })
})

$("#div_modes").off('click', '.bt_removeMode').on('click', '.bt_removeMode', function() {
  $(this).closest('.mode').remove()
  modifyWithoutSave = true
})

$('.eqLogic').off('click', '.mode .modeAction[data-l1key=chooseIcon]').on('click', '.mode .modeAction[data-l1key=chooseIcon]', function() {
  var mode = $(this).closest('.mode')
  jeedomUtils.chooseIcon(function(_icon) {
    mode.find('.modeAttr[data-l1key=icon]').empty().append(_icon)
    mode.find('span.name').html(_icon + ' ' + mode.find('.modeAttr[data-l1key=name]').text())
    modifyWithoutSave = true
  })
})

$('.eqLogic').off('click', '.mode .modeAttr[data-l1key=icon]').on('click', '.mode .modeAttr[data-l1key=icon]', function() {
  let mode = $(this).closest('.mode')
  $(this).empty()
  mode.find('span.name').html('<i class="fas fa-th-list"></i> ' + mode.find('.modeAttr[data-l1key=name]').text())
  modifyWithoutSave = true
})

$('.nav-tabs li a').off('click').on('click', function() {
  setTimeout(function() {
    jeedomUtils.taAutosize()
  }, 50)
})

$('#div_modes').off('click', '.panel-heading').on('click', '.panel-heading', function() {
  setTimeout(function() {
    jeedomUtils.taAutosize()
  }, 50)
})

$("#div_modes").sortable({ axis: "y", cursor: "move", items: ".mode", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true })

function printEqLogic(_eqLogic) {
  $('#div_modes').empty()
  MODE_LIST = []
  if (isset(_eqLogic.configuration) && isset(_eqLogic.configuration.modes)) {
    actionOptions = []
    for (var i in _eqLogic.configuration.modes) {
      MODE_LIST.push(_eqLogic.configuration.modes[i].name)
    }
    for (var i in _eqLogic.configuration.modes) {
      addMode(_eqLogic.configuration.modes[i], false)
    }
    MODE_LIST = null
    jeedom.cmd.displayActionsOption({
      params: actionOptions,
      async: false,
      error: function(error) {
        $('#div_alert').showAlert({ message: error.message, level: 'danger' })
      },
      success: function(data) {
        for (var i in data) {
          $('#' + data[i].id).append(data[i].html.html)
        }
        jeedomUtils.taAutosize()
      }
    })
  }
}

function saveEqLogic(_eqLogic) {
  if (!isset(_eqLogic.configuration)) {
    _eqLogic.configuration = {}
  }
  _eqLogic.configuration.modes = []
  $('#div_modes .mode').each(function() {
    var mode = $(this).getValues('.modeAttr')[0]
    mode.inAction = $(this).find('.inAction').getValues('.expressionAttr')
    mode.outAction = $(this).find('.outAction').getValues('.expressionAttr')
    _eqLogic.configuration.modes.push(mode)
  })
  return _eqLogic
}

function addMode(_mode, _updateMode) {
  if (init(_mode.name) == '') {
    return
  }
  var random = Math.floor((Math.random() * 1000000) + 1)
  var div = '<div class="mode panel panel-default">'
  div += '<div class="panel-heading">'
  div += '<h3 class="panel-title">'
  div += '<a class="accordion-toggle " data-toggle="collapse" href="#collapse' + random + '">'
  div += '<span class="name">' + (_mode.icon && _mode.icon != '' ? _mode.icon : '<i class="fas fa-th-list"></i>') + ' ' + _mode.name + '</span>'
  div += '</a>'
  div += '</h3>'
  div += '</div>'

  div += '<div id="collapse' + random + '" class="panel-collapse collapse">'
  div += '<div class="panel-body">'
  div += '<form class="form-horizontal col-xs-12" role="form">'

  div += '<div class="pull-right">'
  div += '<div class="input-group pull-right" style="display:inline-flex">'
  div += '<span class="input-group-btn">'
  div += '<a class="btn btn-sm btn-succes bt_addInAction roundedLeft"><i class="fas fa-plus-circle"></i> {{Action d\'entrée}}</a>'
  div += '<a class="btn btn-sm btn-warning bt_addOutAction"><i class="fas fa-plus-circle"></i> {{Action de sortie}}</a>'
  div += '<a class="btn btn-sm btn-danger bt_removeMode roundedRight"><i class="fas fa-minus-circle"></i> {{Supprimer}}</a>'
  div += '</span>'
  div += '</div>'
  div += '</div>'

  div += '<div class="form-group">'
  div += '<div class="col-sm-2">'
  div += '<label class="control-label" style="margin-right:7px">{{Nom du mode}}<sup><i class="fas fa-question-circle tooltips" title="{{Cliquer sur le nom du mode pour le modifier}}"></i></sup></label>'
  div += '<span class="modeAttr label label-info rename cursor" data-l1key="name"></span>'
  div += '</div>'

  div += '<div class="col-sm-3">'
  div += '<label class="control-label" style="margin-right:7px">{{Couleur du mode}}<sup><i class="fas fa-question-circle tooltips" title="{{Choisir la couleur représentative de ce mode}}"></i></sup></label>'
  div += '<select class="modeAttr input-sm" data-l1key="modecolor" style="max-width:150px;display:inline-block">'
  div += '<option value="default">{{Aucune}}</option>'
  div += '<option value="icon_blue">{{Bleu}}</option>'
  div += '<option value="icon_yellow">{{Jaune}}</option>'
  div += '<option value="icon_orange">{{Orange}}</option>'
  div += '<option value="icon_red">{{Rouge}}</option>'
  div += '<option value="icon_green">{{Vert}}</option>'
  div += '</select>'
  div += '</div>'

  div += '<div class="col-sm-2">'
  div += '<a class="modeAction btn btn-default btn-sm" data-l1key="chooseIcon"><i class="fas fa-flag"></i> {{Icône}}</a>'
  div += ' <span class="modeAttr label label-info cursor" data-l1key="icon" ></span>'
  div += '</div>'

  div += '</div>'
  div += '<br>'
  div += '<div class="div_inAction col-xs-12" style="display:none;padding-bottom:10px;margin-bottom:15px;background-color:rgb(var(--bg-color));"><legend><i class="fas fa-sign-in-alt icon_blue"></i> {{Action(s) d\'entrée}}</legend></div>'
  div += '<div class="div_outAction col-xs-12" style="display:none;padding-bottom:10px;margin-bottom:15px;background-color:rgb(var(--bg-color));"><legend><i class="fas fa-sign-out-alt icon_orange"></i> {{Action(s) de sortie}}</legend></div>'
  div += '<br>'
  div += '</form>'
  div += '</div>'
  div += '</div>'
  div += '</div>'

  $('#div_modes').append(div)
  $('#div_modes .mode').last().setValues(_mode, '.modeAttr')
  if (is_array(_mode.inAction)) {
    for (var i in _mode.inAction) {
      addAction(_mode.inAction[i], 'inAction', $('#div_modes .mode').last())
    }
  } else {
    if ($.trim(_mode.inAction) != '') {
      addAction(_mode.inAction[i], 'inAction', $('#div_modes .mode').last())
    }
  }

  if (is_array(_mode.outAction)) {
    for (var i in _mode.outAction) {
      addAction(_mode.outAction[i], 'outAction', $('#div_modes .mode').last())
    }
  } else {
    if ($.trim(_mode.outAction) != '') {
      addAction(_mode.outAction, 'outAction', $('#div_modes .mode').last())
    }
  }
  $("#div_modes .mode:last .div_inAction").sortable({ axis: "y", cursor: "move", items: ".inAction", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true })
  $("#div_modes .mode:last .div_outAction").sortable({ axis: "y", cursor: "move", items: ".outAction", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true })
  updateSelectMode()
}

function addAction(_action, _type, _el) {
  if (!isset(_action)) {
    _action = {}
  }
  if (!isset(_action.options)) {
    _action.options = {}
  }
  var input = ''
  var button = 'btn-default'
  if (_type == 'outAction') {
    input = 'has-warning'
    button = 'btn-warning'
  }
  if (_type == 'inAction') {
    input = 'has-success'
    button = 'btn-success'
  }
  var div = '<div class="' + _type + '">'
  div += '<div class="form-group ">'
  div += '<div class="col-sm-2 ' + input + '" style="max-width:250px;">'
  div += '<input type="checkbox" class="expressionAttr" data-l1key="options" data-l2key="enable" checked title="{{Décocher pour désactiver l\'action}}">'
  div += '<input type="checkbox" class="expressionAttr" data-l1key="options" data-l2key="background" title="{{Cocher pour que la commande s\'exécute en parallèle des autres actions}}">'
  div += '<select class="expressionAttr form-control input-sm selectMode" data-l1key="onlyIfMode" style="max-width:170px;display:inline-block" title="{{Entrée : Ne faire cette action que si l\'on vient du mode. Sortie : ne faire les actions que si on va sur le mode}}">'
  div += '<option value="all">{{Tous les modes}}</option>'
  if (MODE_LIST != null) {
    for (var i in MODE_LIST) {
      div += '<option value="' + MODE_LIST[i] + '">' + MODE_LIST[i] + '</option>'
    }
  } else {
    $('#div_modes .mode').each(function() {
      div += '<option value="' + $(this).getValues('.modeAttr')[0].name + '">' + $(this).getValues('.modeAttr')[0].name + '</option>'
    })
  }
  div += '</select>'
  div += '</div>'
  div += '<div class="col-sm-4 ' + input + '">'
  div += '<div class="input-group">'
  div += '<span class="input-group-btn">'
  div += '<a class="btn btn-default bt_removeAction btn-sm roundedLeft" data-type="' + _type + '"><i class="fas fa-minus-circle"></i></a>'
  div += '</span>'
  div += '<input class="expressionAttr form-control input-sm cmdAction" data-l1key="cmd" data-type="' + _type + '" />'
  div += '<span class="input-group-btn">'
  div += '<a class="btn ' + button + ' btn-sm listAction" data-type="' + _type + '" title="{{Sélectionner un mot-clé}}"><i class="fas fa-tasks"></i></a>'
  div += '<a class="btn ' + button + ' btn-sm listCmdAction roundedRight" data-type="' + _type + '" title="{{Sélectionner une commande}}"><i class="fas fa-list-alt"></i></a>'
  div += '</span>'
  div += '</div>'
  div += '</div>'
  var actionOption_id = jeedomUtils.uniqId()
  div += '<div class="col-sm-6 col-lg-5 actionOptions" id="' + actionOption_id + '">'
  div += '</div>'
  div += '</div>'
  if (isset(_el)) {
    _el.find('.div_' + _type).append(div).show()
    _el.find('.' + _type + '').last().setValues(_action, '.expressionAttr')
  } else {
    $('#div_' + _type).append(div)
    $('#div_' + _type + ' .' + _type + '').last().setValues(_action, '.expressionAttr')
  }
  if (actionOptions) {
    actionOptions.push({
      expression: init(_action.cmd, ''),
      options: _action.options,
      id: actionOption_id
    })
  }
}

function updateSelectMode(_convert) {
  $('select.selectMode').each(function() {
    var value = $(this).val()
    $(this).empty()
    var options = '<option value="all">{{Tous les modes}}</option>'
    if (MODE_LIST != null) {
      for (var i in MODE_LIST) {
        options += '<option value="' + MODE_LIST[i] + '">' + MODE_LIST[i] + '</option>'
      }
    } else {
      $('#div_modes .mode').each(function() {
        options += '<option value="' + $(this).getValues('.modeAttr')[0].name + '">' + $(this).getValues('.modeAttr')[0].name + '</option>'
      })
    }
    $(this).append(options)
    if (isset(_convert) && isset(_convert[value])) {
      value = _convert[value]
    }
    $(this).val(value)
  })
}
