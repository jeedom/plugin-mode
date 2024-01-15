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

var MODE_LIST = null
var actionOptions = null

document.getElementById('modetab').addEventListener('click', function(event) {
  var _target = null
  if (_target = event.target.closest('#bt_addMode')) {
    jeeDialog.prompt('{{Nom du mode}}' + ' ?', function(result) {
      if (result !== null) {
        addMode({ name: result })
        updateSelectMode()
        jeeFrontEnd.modifyWithoutSave = true
      }
    })
    return
  }

  if (_target = event.target.closest('.rename')) {
    jeeDialog.prompt('{{Nouveau nom du mode}}' + ' ?', function(result) {
      if (result !== null) {
        let modeTitle = _target.closest('.mode').querySelector('.name')
        let previousName = _target.innerText
        modeTitle.innerHTML = modeTitle.innerHTML.replace(previousName, result)
        _target.innerText = result
        updateSelectMode({ [previousName]: result })
        _target.closest('.mode').setAttribute('renamed', previousName)
        jeeFrontEnd.modifyWithoutSave = true
      }
    })
    return
  }

  if (_target = event.target.closest('.bt_removeMode')) {
    let mode = _target.closest('.mode')
    let modeName = mode.querySelector('.rename').innerText
    mode.remove()
    updateSelectMode({ [modeName]: 'all' })
    jeeFrontEnd.modifyWithoutSave = true
    return
  }

  if (_target = event.target.closest('.bt_addInAction')) {
    addAction({}, 'inAction', _target.closest('.mode'))
    jeeFrontEnd.modifyWithoutSave = true
    return
  }

  if (_target = event.target.closest('.bt_addOutAction')) {
    addAction({}, 'outAction', _target.closest('.mode'))
    jeeFrontEnd.modifyWithoutSave = true
    return
  }

  if (_target = event.target.closest('.bt_removeAction')) {
    let type = _target.getAttribute('data-type')
    let divActions = _target.closest('.div_' + type)
    _target.closest('.' + type).remove()
    if (divActions.querySelectorAll('.' + type).length == 0) {
      divActions.unseen()
    }
    jeeFrontEnd.modifyWithoutSave = true
    return
  }

  if (_target = event.target.closest('.listCmdAction')) {
    var type = _target.getAttribute('data-type')
    var el = _target.closest('.' + type).querySelector('.expressionAttr[data-l1key="cmd"]')
    jeedom.cmd.getSelectModal({ cmd: { type: 'action' } }, function(result) {
      el.jeeValue(result.human)
      jeedom.cmd.displayActionOption(el.jeeValue(), '', function(html) {
        el.closest('.' + type).querySelector('.actionOptions').html(html)
        jeedomUtils.taAutosize()
      })
    })
    return
  }

  if (_target = event.target.closest('.listAction')) {
    var type = _target.getAttribute('data-type')
    var el = _target.closest('.' + type).querySelector('.expressionAttr[data-l1key="cmd"]')
    jeedom.getSelectActionModal({}, function(result) {
      el.jeeValue(result.human)
      jeedom.cmd.displayActionOption(el.jeeValue(), '', function(html) {
        el.closest('.' + type).querySelector('.actionOptions').html(html)
        jeedomUtils.taAutosize()
      })
    })
    return
  }

  if (_target = event.target.closest('.modeAction[data-l1key=chooseIcon]')) {
    jeedomUtils.chooseIcon(function(_icon) {
      let mode = _target.closest('.mode')
      mode.querySelector('.modeAttr[data-l1key=icon]').empty().innerHTML = _icon
      mode.querySelector('span.name').innerHTML = _icon + ' ' + mode.querySelector('.modeAttr[data-l1key=name]').innerText
      jeeFrontEnd.modifyWithoutSave = true
    })
    return
  }

  if (_target = event.target.closest('.modeAttr[data-l1key=icon]')) {
    let mode = _target.closest('.mode')
    mode.querySelector('span.name').innerHTML = '<i class="fas fa-th-list"></i> ' + mode.querySelector('.modeAttr[data-l1key=name]').innerText
    _target.empty()
    jeeFrontEnd.modifyWithoutSave = true
    return
  }

  if (_target = event.target.closest('.nav-tabs li a')) {
    setTimeout(function() {
      jeedomUtils.taAutosize()
    }, 50)
    return
  }

  if (_target = event.target.closest('.panel-heading')) {
    setTimeout(function() {
      jeedomUtils.taAutosize()
    }, 50)
    return
  }
})

document.getElementById('div_modes').addEventListener('focusout', function(event) {
  if (_target = event.target.closest('.cmdAction.expressionAttr[data-l1key="cmd"]')) {
    var type = _target.getAttribute('data-type')
    var expression = _target.closest('.' + type).getJeeValues('.expressionAttr')
    jeedom.cmd.displayActionOption(_target.jeeValue(), init(expression[0].options), function(html) {
      _target.closest('.' + type).querySelector('.actionOptions').html(html)
      jeedomUtils.taAutosize()
    })
    return
  }
})

new Sortable(document.getElementById('div_modes'), {
  delay: 50,
  draggable: '.mode',
  direction: 'vertical',
  chosenClass: 'dragSelected',
  onUpdate: function(evt) {
    jeeFrontEnd.modifyWithoutSave = true
  }
})

function printEqLogic(_eqLogic) {
  document.getElementById('div_modes').empty()
  MODE_LIST = []
  if (isset(_eqLogic.configuration) && isset(_eqLogic.configuration.modes)) {
    actionOptions = []
    for (var i in _eqLogic.configuration.modes) {
      MODE_LIST.push(_eqLogic.configuration.modes[i].name)
    }
    for (var i in _eqLogic.configuration.modes) {
      addMode(_eqLogic.configuration.modes[i])
    }
    MODE_LIST = null
    jeedom.cmd.displayActionsOption({
      params: actionOptions,
      async: false,
      error: function(error) {
        jeedomUtils.showAlert({
          message: error.message,
          level: 'danger'
        })
      },
      success: function(data) {
        for (var i in data) {
          document.getElementById(data[i].id).html(data[i].html.html, true)
        }
        jeedomUtils.taAutosize()
      }
    })
    actionOptions = null
  }
}

function saveEqLogic(_eqLogic) {
  if (!isset(_eqLogic.configuration)) {
    _eqLogic.configuration = {}
  }
  _eqLogic.configuration.modes = []
  document.querySelectorAll('.mode').forEach(_mode => {
    let mode = _mode.getJeeValues('.modeAttr')[0]
    mode.renamed = _mode.getAttribute('renamed')
    mode.inAction = _mode.querySelectorAll('.inAction').getJeeValues('.expressionAttr')
    mode.outAction = _mode.querySelectorAll('.outAction').getJeeValues('.expressionAttr')
    _eqLogic.configuration.modes.push(mode)
  })
  return _eqLogic
}

function addMode(_mode) {
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
  div += '<div class="div_inAction col-xs-12" style="display:none;padding-bottom:10px;margin-bottom:15px;background-color:rgb(var(--bg-color));"><legend><i class="fas fa-sign-in-alt icon_green"></i> {{Action(s) d\'entrée}}</legend></div>'
  div += '<div class="div_outAction col-xs-12" style="display:none;padding-bottom:10px;margin-bottom:15px;background-color:rgb(var(--bg-color));"><legend><i class="fas fa-sign-out-alt icon_orange"></i> {{Action(s) de sortie}}</legend></div>'
  div += '<br>'
  div += '</form>'
  div += '</div>'
  div += '</div>'
  div += '</div>'

  document.getElementById('div_modes').insertAdjacentHTML('beforeend', div)
  var currentMode = document.querySelectorAll('.mode').last()
  currentMode.setJeeValues(_mode, '.modeAttr')

  if (is_array(_mode.inAction)) {
    for (var i in _mode.inAction) {
      addAction(_mode.inAction[i], 'inAction', currentMode)
    }
  }

  if (is_array(_mode.outAction)) {
    for (var i in _mode.outAction) {
      addAction(_mode.outAction[i], 'outAction', currentMode)
    }
  }

  new Sortable(currentMode.querySelector('.div_inAction'), {
    delay: 50,
    delayOnTouchOnly: true,
    draggable: '.inAction',
    filter: '.expressionAttr',
    preventOnFilter: false,
    direction: 'vertical',
    chosenClass: 'dragSelected',
    onUpdate: function(evt) {
      jeeFrontEnd.modifyWithoutSave = true
    }
  })

  new Sortable(currentMode.querySelector('.div_outAction'), {
    delay: 50,
    delayOnTouchOnly: true,
    draggable: '.outAction',
    filter: '.expressionAttr',
    preventOnFilter: false,
    direction: 'vertical',
    chosenClass: 'dragSelected',
    onUpdate: function(evt) {
      jeeFrontEnd.modifyWithoutSave = true
    }
  })

  currentMode.addEventListener('change', function(event) {
    if (_target = event.target.closest('.modeAttr')) {
      jeeFrontEnd.modifyWithoutSave = true
      return
    }
    if (_target = event.target.closest('.expressionAttr')) {
      jeeFrontEnd.modifyWithoutSave = true
      return
    }
  })
}

function addAction(_action, _type, _el) {
  if (!isset(_action)) {
    _action = {}
  }
  if (!isset(_action.options)) {
    _action.options = {}
  }

  var button = 'btn-success'
  if (_type == 'outAction') {
    button = 'btn-warning'
  }

  var div = '<div class="' + _type + '">'
  div += '<div class="form-group ">'
  div += '<div class="col-sm-2" style="max-width:250px;">'
  div += '<input type="checkbox" class="expressionAttr" data-l1key="options" data-l2key="enable" checked title="{{Décocher pour désactiver l\'action}}">'
  div += '<input type="checkbox" class="expressionAttr" data-l1key="options" data-l2key="background" title="{{Cocher pour que la commande s\'exécute en parallèle des autres actions}}">'
  div += '<select class="expressionAttr form-control input-sm selectMode" data-l1key="onlyIfMode" style="max-width:170px;display:inline-block" title="{{Entrée : n\'exécute l\'action qu\'en venant du mode spécifié}}<br>{{Sortie : n\'exécute l\'action qu\'en allant sur le mode spécifié}}">'
  div += '<option value="all">{{Tous les modes}}</option>'
  var currentMode = _el.querySelector('.modeAttr[data-l1key=name]').innerText
  if (MODE_LIST != null) {
    for (var i in MODE_LIST) {
      if (MODE_LIST[i] != currentMode) {
        div += '<option value="' + MODE_LIST[i] + '">' + MODE_LIST[i] + '</option>'
      }
    }
  } else {
    document.querySelectorAll('.mode').forEach(_mode => {
      let modeName = _mode.querySelector('.modeAttr[data-l1key=name]').innerText
      if (modeName != currentMode) {
        div += '<option value="' + modeName + '">' + modeName + '</option>'
      }
    })
  }
  div += '</select>'
  div += '</div>'
  div += '<div class="col-sm-4">'
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
  div += '<div class="col-sm-6 actionOptions" id="' + actionOption_id + '">'
  div += '</div>'
  div += '</div>'

  _el.querySelector('.div_' + _type).seen().insertAdjacentHTML('beforeend', div)
  let currentAction = _el.querySelectorAll('.' + _type + '').last()
  currentAction.setJeeValues(_action, '.expressionAttr')
  currentAction.querySelector('.expressionAttr[data-l1key="cmd"]').jeeComplete({
    source: jeedom.scenario.autoCompleteAction,
    forceSingle: true
  })

  if (is_array(actionOptions)) {
    actionOptions.push({
      expression: init(_action.cmd),
      options: _action.options,
      id: actionOption_id
    })
  }
}

function updateSelectMode(_convert) {
  document.querySelectorAll('select.selectMode').forEach(_select => {
    var value = _select.jeeValue()
    _select.empty()
    var currentMode = _select.closest('.mode').querySelector('.modeAttr[data-l1key=name]').innerText
    var options = '<option value="all">{{Tous les modes}}</option>'
    document.querySelectorAll('.mode').forEach(_mode => {
      let modeName = _mode.querySelector('.modeAttr[data-l1key=name]').innerText
      if (modeName != currentMode) {
        options += '<option value="' + modeName + '">' + modeName + '</option>'
      }
    })
    _select.innerHTML = options
    if (isset(_convert) && isset(_convert[value])) {
      value = _convert[value]
    }
    _select.jeeValue(value)
  })
}
