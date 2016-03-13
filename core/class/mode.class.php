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
	/*     * *************************Attributs****************************** */

	/*     * ***********************Methode static*************************** */

	/*     * *********************Méthodes d'instance************************* */

	public function postSave() {
		$currentMode = $this->getCmd(null, 'currentMode');
		if (!is_object($currentMode)) {
			$currentMode = new modeCmd();
			$currentMode->setTemplate('dashboard', 'tile');
			$currentMode->setTemplate('mobile', 'tile');
		}
		$currentMode->setName(__('Mode', __FILE__));
		$currentMode->setEqLogic_id($this->id);
		$currentMode->setLogicalId('currentMode');
		$currentMode->setType('info');
		$currentMode->setOrder(1);
		$currentMode->setSubType('string');
		$currentMode->setDisplay('generic_type', 'MODE_STATE');
		$currentMode->save();

		$existing_mode = array();
		if (is_array($this->getConfiguration('modes'))) {
			foreach ($this->getConfiguration('modes') as $key => $value) {
				$existing_mode[] = $value['name'];
				$cmd = $this->getCmd(null, $value['name']);
				if (!is_object($cmd)) {
					$cmd = new modeCmd();
				}
				$cmd->setName($value['name']);
				$cmd->setEqLogic_id($this->id);
				$cmd->setType('action');
				$cmd->setSubType('other');
				$cmd->setOrder(2);
				$cmd->setLogicalId($value['name']);
				$cmd->setDisplay('generic_type', 'MODE_SET_STATE');
				if (isset($value['icon'])) {
					$cmd->setDisplay('icon', $value['icon']);
				} else {
					$cmd->setDisplay('icon', '');
				}
				$cmd->save();
			}
		}

		foreach ($this->getCmd() as $cmd) {
			if ($cmd->getType() == 'action' && !in_array($cmd->getName(), $existing_mode)) {
				$cmd->remove();
			}
		}
	}

	public function doAction($_mode, $_type) {
		if (!is_array($this->getConfiguration('modes'))) {
			return;
		}
		$actions = array();
		foreach ($this->getConfiguration('modes') as $key => $value) {
			if ($value['name'] == $_mode) {
				foreach ($value[$_type] as $action) {
					try {
						$options = array();
						if (isset($action['options'])) {
							$options = $action['options'];
						}
						scenarioExpression::createAndExec('action', $action['cmd'], $options);
					} catch (Exception $e) {
						log::add('alarm', 'error', __('Erreur lors de l\'éxecution de ', __FILE__) . $action['cmd'] . __('. Détails : ', __FILE__) . $e->getMessage());
					}
				}
				return;
			}
		}

	}

	/*     * **********************Getteur Setteur*************************** */
}

class modeCmd extends cmd {
	/*     * *************************Attributs****************************** */

	/*     * ***********************Methode static*************************** */

	/*     * *********************Methode d'instance************************* */

	public function imperihomeGenerate($ISSStructure) {
		$eqLogic = $this->getEqLogic();
		$object = $eqLogic->getObject();
		$type = 'DevMultiSwitch';
		$info_device = array(
			'id' => $this->getId(),
			'name' => $eqLogic->getName(),
			'room' => (is_object($object)) ? $object->getId() : 99999,
			'type' => $type,
			'params' => array(),
		);
		$info_device['params'] = $ISSStructure[$info_device['type']]['params'];
		$info_device['params'][0]['value'] = '#' . $eqLogic->getCmd('info', 'currentMode')->getId() . '#';
		foreach ($eqLogic->getCmd('action') as $cmd) {
			$info_device['params'][1]['value'] .= $cmd->getName() . ',';
		}
		$info_device['params'][1]['value'] = trim($info_device['params'][1]['value'], ',');
		return $info_device;
	}

	public function imperihomeAction($_action, $_value) {
		if ($_action == 'setChoice') {
			$eqLogic = $this->getEqLogic();
			$eqLogic->getCmd('action', $_value)->execCmd();
		}
	}

	public function imperihomeCmd() {
		if ($this->getLogicalId() == 'currentMode') {
			return true;
		}
		return false;
	}

	public function dontRemoveCmd() {
		return true;
	}

	public function formatValueWidget($_mode) {
		$eqLogic = $this->getEqLogic();
		foreach ($eqLogic->getConfiguration('modes') as $key => $value) {
			if ($value['name'] == $_mode) {
				if (isset($value['icon']) && $value['icon'] != '') {
					return $value['icon'];
				}
			}
		}
		return $_mode;
	}

	public function execute($_options = array()) {
		$eqLogic = $this->getEqLogic();
		$currentMode = $eqLogic->getCmd(null, 'currentMode');
		if (!is_object($currentMode)) {
			throw new Exception(__('La commande de mode courant est introuvable', __FILE__));
		}
		$mode = $currentMode->execCmd();
		$newMode = $this->getLogicalId();
		if ($mode != $newMode) {
			$eqLogic->doAction($mode, 'outAction');
		}
		$eqLogic->doAction($newMode, 'inAction');
		$currentMode->setCollectDate('');
		$currentMode->event($newMode);
		return;
	}

	/*     * **********************Getteur Setteur*************************** */
}

?>
