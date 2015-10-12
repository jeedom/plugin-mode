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
		}
		$currentMode->setName(__('Mode', __FILE__));
		$currentMode->setEqLogic_id($this->id);
		$currentMode->setLogicalId('currentMode');
		$currentMode->setType('info');
		$currentMode->setOrder(1);
		$currentMode->setEventOnly(1);
		$currentMode->setSubType('string');
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
				$cmd->save();
			}
		}

		foreach ($this->getCmd() as $cmd) {
			if ($cmd->getType() == 'action' && !in_array($cmd->getName(), $existing_mode)) {
				$cmd->remove();
			}
		}
	}

	public function toHtml($_version = 'dashboard') {
		if ($this->getIsEnable() != 1) {
			return '';
		}
		if (!$this->hasRight('r')) {
			return '';
		}
		$_version = jeedom::versionAlias($_version);
		if ($this->getDisplay('hideOn' . $_version) == 1) {
			return '';
		}
		$vcolor = 'cmdColor';
		if ($_version == 'mobile') {
			$vcolor = 'mcmdColor';
		}
		$parameters = $this->getDisplay('parameters');
		$cmdColor = ($this->getPrimaryCategory() == '') ? jeedom::getConfiguration('eqLogic:category:default:' . $vcolor) : jeedom::getConfiguration('eqLogic:category:' . $this->getPrimaryCategory() . ':' . $vcolor);
		if (is_array($parameters) && isset($parameters['background_cmd_color'])) {
			$cmdColor = $parameters['background_cmd_color'];
		}
		$replace = array(
			'#name#' => $this->getName(),
			'#id#' => $this->getId(),
			'#background_color#' => $this->getBackgroundColor($_version),
			'#eqLink#' => $this->getLinkToConfiguration(),
			'#cmdColor#' => $cmdColor,
			'#color#' => '',
			'#clear#' => '',
			'#select_mode#' => '',
			'#uid#' => 'mode' . $this->getId() . self::UIDDELIMITER . mt_rand() . self::UIDDELIMITER,
		);
		$currentMode = $this->getCmd(null, 'currentMode');
		$currentSelectMode = '';
		if (is_object($currentMode)) {
			$currentSelectMode = $currentMode->execCmd(null, 2);
		}

		foreach ($this->getCmd('action') as $cmd) {
			if ($cmd->getIsVisible() == 1 && $cmd->getDisplay('hideOn' . $_version) != 1 && $cmd->getLogicalId() != 'color' && $cmd->getLogicalId() != 'clear') {
				if ($currentSelectMode == $cmd->getName()) {
					$replace['#select_mode#'] .= '<option value="' . $cmd->getId() . '" selected>' . $cmd->getName() . '</option>';
				} else {
					$replace['#select_mode#'] .= '<option value="' . $cmd->getId() . '">' . $cmd->getName() . '</option>';
				}
			}
		}
		if (is_array($parameters)) {
			foreach ($parameters as $key => $value) {
				$replace['#' . $key . '#'] = $value;
			}
		}

		$html = template_replace($replace, getTemplate('core', $_version, 'mode', 'mode'));
		return $html;
	}

	public function doAction($_mode, $_type) {
		if (!is_array($this->getConfiguration('modes'))) {
			return;
		}
		$actions = array();
		foreach ($this->getConfiguration('modes') as $key => $value) {
			if ($value['name'] == $_mode) {
				$actions = $value[$_type];
				break;
			}
		}
		foreach ($actions as $action) {
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

	public function execute($_options = array()) {
		$eqLogic = $this->getEqLogic();
		$currentMode = $eqLogic->getCmd(null, 'currentMode');
		if (!is_object($currentMode)) {
			throw new Exception(__('La commande de mode courant est introuvable', __FILE__));
		}
		$mode = $currentMode->execCmd(null, 2);
		$newMode = $this->getLogicalId();
		if ($mode == $newMode) {
			return;
		}
		$eqLogic->doAction($mode, 'outAction');
		$eqLogic->doAction($newMode, 'inAction');
		$currentMode->event($newMode);
		return;
	}

	/*     * **********************Getteur Setteur*************************** */
}

?>
