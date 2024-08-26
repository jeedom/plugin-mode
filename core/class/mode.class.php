<?php

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

/* * ***************************Includes********************************* */
require_once dirname(__FILE__) . '/../../../../core/php/core.inc.php';

class mode extends eqLogic {

	public static function templateWidget() {
		$return = array('info' => array('string' => array()));
		$return['info']['string']['state'] = array(
			'template' => 'tmplmultistate',
			'replace' => array('#_time_widget_#' => 1),
			'test' => array(
				array('operation' => 'true', 'state_light' => '#value#')
			)
		);
		return $return;
	}

	public function postSave() {
		$i = 0;

		$lockState = $this->getCmd(null, 'lock_state');
		if ($this->getConfiguration('showLockCmd') == 1) {
			if (!is_object($lockState)) {
				$lockState = new modeCmd();
				$lockState->setEqLogic_id($this->getId());
				$lockState->setLogicalId('lock_state');
				$lockState->setName(__('Verrouillage', __FILE__));
				$lockState->setTemplate('dashboard', 'lock');
				$lockState->setTemplate('mobile', 'lock');
				$lockState->setIsVisible(0);
			}
			$lockState->setType('info');
			$lockState->setSubType('binary');
			$lockState->setOrder($i);
			$i++;
			$lockState->save();
		} else {
			if (is_object($lockState)) {
				$lockState->remove();
			}
		}

		$lock = $this->getCmd(null, 'lock');
		if ($this->getConfiguration('showLockCmd') == 1) {
			if (!is_object($lock)) {
				$lock = new modeCmd();
				$lock->setEqLogic_id($this->getId());
				$lock->setLogicalId('lock');
				$lock->setName(__('Verrouiller', __FILE__));
				$lock->setTemplate('dashboard', 'lock');
				$lock->setTemplate('mobile', 'lock');
			}
			$lock->setType('action');
			$lock->setSubType('other');
			$lock->setOrder($i);
			$i++;
			$lock->setValue($lockState->getId());
			$lock->save();
		} else {
			if (is_object($lock)) {
				$lock->remove();
			}
		}

		$unlock = $this->getCmd(null, 'unlock');
		if ($this->getConfiguration('showLockCmd') == 1) {
			if (!is_object($unlock)) {
				$unlock = new modeCmd();
				$unlock->setEqLogic_id($this->getId());
				$unlock->setLogicalId('unlock');
				$unlock->setName(__('Déverrouiller', __FILE__));
				$unlock->setTemplate('dashboard', 'lock');
				$unlock->setTemplate('mobile', 'lock');
			}
			$unlock->setType('action');
			$unlock->setSubType('other');
			$unlock->setOrder($i);
			$i++;
			$unlock->setValue($lockState->getId());
			$unlock->save();
		} else {
			if (is_object($unlock)) {
				$unlock->remove();
			}
		}

		$currentMode = $this->getCmd(null, 'currentMode');
		if (!is_object($currentMode)) {
			$currentMode = new modeCmd();
			$currentMode->setEqLogic_id($this->id);
			$currentMode->setLogicalId('currentMode');
			$currentMode->setName(__('Mode', __FILE__));
			$currentMode->setTemplate('dashboard', 'tile');
			$currentMode->setTemplate('mobile', 'tile');
		}
		$currentMode->setType('info');
		$currentMode->setSubType('string');
		$currentMode->setDisplay('generic_type', 'MODE_STATE');
		$currentMode->setOrder($i);
		$i++;
		$currentMode->save();

		$previousMode = $this->getCmd(null, 'previousMode');
		if (!is_object($previousMode)) {
			$previousMode = new modeCmd();
			$previousMode->setEqLogic_id($this->id);
			$previousMode->setLogicalId('previousMode');
			$previousMode->setName(__('Mode précédent', __FILE__));
			$previousMode->setTemplate('dashboard', 'tile');
			$previousMode->setTemplate('mobile', 'tile');
			$previousMode->setIsVisible(0);
		}
		$previousMode->setType('info');
		$previousMode->setSubType('string');
		$previousMode->setDisplay('generic_type', 'DONT');
		$previousMode->setOrder($i);
		$i++;
		$previousMode->save();

		$replay = $this->getCmd(null, 'replay');
		if ($this->getConfiguration('showReplayCmd') == 1) {
			if (!is_object($replay)) {
				$replay = new modeCmd();
				$replay->setEqLogic_id($this->id);
				$replay->setLogicalId('replay');
				$replay->setName(__('Rejouer', __FILE__));
				$replay->setDisplay('icon', '<i class="fas fa-redo"></i>');
			}
			$replay->setType('action');
			$replay->setSubType('other');
			$replay->setDisplay('generic_type', 'MODE_SET_STATE');
			$replay->setOrder($i);
			$i++;
			$replay->save();
		} else {
			if (is_object($replay)) {
				$replay->remove();
			}
		}

		$returnPreviousMode = $this->getCmd(null, 'returnPreviousMode');
		if ($this->getConfiguration('showPreviousCmd') == 1) {
			if (!is_object($returnPreviousMode)) {
				$returnPreviousMode = new modeCmd();
				$returnPreviousMode->setEqLogic_id($this->id);
				$returnPreviousMode->setLogicalId('returnPreviousMode');
				$returnPreviousMode->setName(__('Retour mode précédent', __FILE__));
				$returnPreviousMode->setDisplay('icon', '<i class="fas fa-backward"></i>');
			}
			$returnPreviousMode->setType('action');
			$returnPreviousMode->setSubType('other');
			$returnPreviousMode->setDisplay('generic_type', 'MODE_SET_STATE');
			$returnPreviousMode->setOrder($i);
			$i++;
			$returnPreviousMode->save();
		} else {
			if (is_object($returnPreviousMode)) {
				$returnPreviousMode->remove();
			}
		}

		$gotoNextMode = $this->getCmd(null, 'nextMode');
		if ($this->getConfiguration('showNextCmd') == 1) {
			if (!is_object($gotoNextMode)) {
				$gotoNextMode = new modeCmd();
				$gotoNextMode->setEqLogic_id($this->id);
				$gotoNextMode->setLogicalId('nextMode');
				$gotoNextMode->setName(__('Aller au mode suivant', __FILE__));
				$gotoNextMode->setDisplay('icon', '<i class="fas fa-forward"></i>');
			}
			$gotoNextMode->setType('action');
			$gotoNextMode->setSubType('other');
			$gotoNextMode->setDisplay('generic_type', 'MODE_SET_STATE');
			$gotoNextMode->setOrder(99);
			$gotoNextMode->save();
		} else {
			if (is_object($gotoNextMode)) {
				$gotoNextMode->remove();
			}
		}

		$existing_mode = array();
		if (is_array($this->getConfiguration('modes'))) {
			foreach (array_values($this->getConfiguration('modes')) as $value) {
				$existing_mode[] = $value['name'];
				if (!isset($value['renamed'])) {
					$cmd = $this->getCmd(null, $value['name']);
				} else {
					$cmd = $this->getCmd(null, $value['renamed']);
				}
				if (!is_object($cmd)) {
					$cmd = new modeCmd();
					$cmd->setEqLogic_id($this->id);
				}
				$cmd->setLogicalId($value['name']);
				$cmd->setName($value['name']);
				$cmd->setType('action');
				$cmd->setSubType('other');
				$cmd->setDisplay('generic_type', 'MODE_SET_STATE');
				$cmd->setValue($currentMode->getId());
				$cmd->setOrder($i);
				$i++;
				if (isset($value['icon'])) {
					$cmd->setDisplay('icon', $value['icon']);
				} else {
					$cmd->setDisplay('icon', '');
				}
				$cmd->save();
			}
		}

		foreach ($this->getCmd() as $cmd) {
			if ($cmd->getType() == 'action' && !in_array($cmd->getLogicalId(), $existing_mode) && !in_array($cmd->getLogicalId(), ['returnPreviousMode', 'lock', 'unlock', 'nextMode', 'replay'])) {
				$cmd->remove();
			}
		}
	}

	public function doAction($_mode, $_type, $_previousMode = '') {
		if (!is_array($this->getConfiguration('modes'))) {
			return;
		}
		if ($_previousMode == '') {
			$_previousMode = $this->getCache('previousMode');
		}
		$logText = ($_type === 'inAction') ? [__('Entrée dans le mode', __FILE__), __('mode précédent', __FILE__)] : [__('Sortie du mode', __FILE__), __('mode suivant', __FILE__)];
		log::add(__CLASS__, 'debug', $this->getHumanName() . ' ' . $logText[0] . ' ' . $_mode . ' (' . $logText[1] . ' : ' . $_previousMode . ')');

		foreach ($this->getConfiguration('modes') as $key => $value) {
			if ($value['name'] != $_mode) {
				continue;
			}
			if (empty($value[$_type])) {
				log::add(__CLASS__, 'debug', $this->getHumanName() . ' ' . __('Aucune action à effectuer', __FILE__));
				continue;
			}
			foreach ($value[$_type] as $action) {
				if (!isset($action['cmd']) || empty($action['cmd'])) {
					log::add(__CLASS__, 'debug', $this->getHumanName() . ' ' . __('Action ignorée car le champ est vide', __FILE__));
					continue;
				}
				if (isset($action['onlyIfMode']) && $action['onlyIfMode'] != 'all' && $action['onlyIfMode'] != $_previousMode) {
					log::add(__CLASS__, 'debug', $this->getHumanName() . ' ' . __('Action ignorée car le', __FILE__) . ' ' . $logText[1] . ' ' . __('ne correspond pas', __FILE__) . ' : ' . $_previousMode . ' != ' . $action['onlyIfMode']);
					continue;
				}
				try {
					$options = array();
					if (isset($action['options'])) {
						if ($action['options']['enable'] == 0) {
							log::add(__CLASS__, 'debug', $this->getHumanName() . ' ' . __('Action ignorée car désactivée', __FILE__) . ' : ' . $action['cmd']);
							continue;
						}
						$options = $action['options'];
					}
					log::add(__CLASS__, 'debug', $this->getHumanName() . ' ' . __("Exécution de l'action", __FILE__) . ' ' . $action['cmd'] . ' (' . __('options', __FILE__) . ' : ' . json_encode($options) . ')');
					scenarioExpression::createAndExec('action', $action['cmd'], $options);
				} catch (Exception $e) {
					log::add(__CLASS__, 'error', __("Erreur lors de l'exécution de", __FILE__) . ' ' . $action['cmd'] . '. ' . __('Détails', __FILE__) . ' : ' . $e->getMessage());
				}
			}
			return;
		}
	}

	public static function deadCmd() {
		$return = array();
		foreach (eqLogic::byType(__CLASS__) as $mode) {
			foreach ($mode->getConfiguration('modes') as $key => $value) {
				foreach ($value['inAction'] as $inAction) {
					$json = json_encode($inAction);
					preg_match_all("/#([0-9]*)#/", $json, $matches);
					foreach ($matches[1] as $cmd_id) {
						if (is_numeric($cmd_id)) {
							if (!cmd::byId(str_replace('#', '', $cmd_id))) {
								$return[] = array('detail' => __('Mode', __FILE__) . ' ' . $value['name'] . ' ' . __("dans l'équipement", __FILE__) . ' ' . $mode->getName(), 'help' => __("Action d'entrée", __FILE__), 'who' => $inAction['cmd']);
							}
						}
					}
				}
				foreach ($value['outAction'] as $outAction) {
					$json = json_encode($outAction);
					preg_match_all("/#([0-9]*)#/", $json, $matches);
					foreach ($matches[1] as $cmd_id) {
						if (is_numeric($cmd_id)) {
							if (!cmd::byId(str_replace('#', '', $cmd_id))) {
								$return[] = array('detail' => __('Mode', __FILE__) . ' ' . $value['name'] . ' ' . __("dans l'équipement", __FILE__) . ' ' . $mode->getName(), 'help' => __('Action de sortie', __FILE__), 'who' => $outAction['cmd']);
							}
						}
					}
				}
			}
		}
		return $return;
	}
}

class modeCmd extends cmd {

	public function dontRemoveCmd() {
		return true;
	}

	public function formatValueWidget($_mode) {
		if ($this->getLogicalId() == 'lock_state') {
			return $_mode;
		}
		$eqLogic = $this->getEqLogic();
		foreach ($eqLogic->getConfiguration('modes') as $key => $value) {
			if ($value['name'] != $_mode) {
				continue;
			}
			$return = $_mode;
			if (isset($value['icon']) && $value['icon'] != '') {
				$return = $value['icon'];
				if (isset($value['modecolor']) && $value['modecolor'] != '') {
					$return = str_replace('class="', 'class="' . $value['modecolor'] . ' ', $return);
				}
			} else if (isset($value['modecolor']) && $value['modecolor'] != '' && $value['modecolor'] != 'default') {
				$return = '<span class="' . $value['modecolor'] . '">' . $return . '</span>';
			}
			return $return;
		}
		return $_mode;
	}

	public function execute($_options = array()) {
		$eqLogic = $this->getEqLogic();

		$lockState = $eqLogic->getCmd(null, 'lock_state');
		if (is_object($lockState)) {
			if ($this->getLogicalId() == 'lock') {
				log::add('mode', 'debug', $eqLogic->getHumanName() . ' ' . __("L'équipement est verrouillé : aucun changement de mode n'est autorisé", __FILE__));
				$lockState->event(1);
				return;
			} else if ($this->getLogicalId() == 'unlock') {
				log::add('mode', 'debug', $eqLogic->getHumanName() . ' ' . __("L'équipement est déverrouillé : les changements de mode sont autorisés", __FILE__));
				$lockState->event(0);
				return;
			} else if ($lockState->execCmd() == 1) {
				log::add('mode', 'info', $eqLogic->getHumanName() . ' ' . __("L'équipement est verrouillé : changement de mode interdit vers", __FILE__) . ' ' . $this->getName());
				return;
			} else {
				log::add('mode', 'info', $eqLogic->getHumanName() . ' ' . __("L'équipement est déverrouillé : changement de mode autorisé vers", __FILE__) . ' ' . $this->getName());
			}
		}
		if ($this->getLogicalId() == 'returnPreviousMode') {
			if ($eqLogic->getCache('previousMode') == '') {
				return;
			}
			$cmd = $eqLogic->getCmd('action', $eqLogic->getCache('previousMode'));
			if (!is_object($cmd)) {
				return;
			}
			$cmd->execCmd();
			return;
		}
		if ($this->getLogicalId() == 'nextMode') {
			$mode = $eqLogic->getCmd(null, 'currentMode')->execCmd();
			$modes = $eqLogic->getConfiguration('modes');
			if (is_array($modes)) {
				$nextPosition = 0;
				foreach ($modes as $key => $value) {
					if ($mode == $value['name']) {
						$nextPosition = $key + 1;
						break;
					}
				}
				if (count($modes) - 1 < $nextPosition) {
					$nextPosition = 0;
				}
				$cmd = $eqLogic->getCmd('action', $modes[$nextPosition]['name']);
				$cmd->execCmd();
			}
			return;
		}
		if ($this->getLogicalId() == 'replay') {
			$currentMode = $eqLogic->getCmd(null, 'currentMode');
			if (!is_object($currentMode)) {
				throw new Exception(__('La commande du mode courant est introuvable', __FILE__));
			}
			$mode = $currentMode->execCmd();
			$eqLogic->doAction($mode, 'inAction', '');
			return;
		}
		$currentMode = $eqLogic->getCmd(null, 'currentMode');
		if (!is_object($currentMode)) {
			throw new Exception(__('La commande du mode courant est introuvable', __FILE__));
		}
		$mode = $currentMode->execCmd();
		$newMode = $this->getLogicalId();
		$currentMode->event($newMode);
		if ($mode != $newMode) {
			$eqLogic->setCache('previousMode', $mode);
			$previousMode = $eqLogic->getCmd(null, 'previousMode');
			if (is_object($previousMode)) {
				$previousMode->event($mode);
			}
			$eqLogic->doAction($mode, 'outAction', $newMode);
		}
		$eqLogic->doAction($newMode, 'inAction', $mode);
		return;
	}
}
