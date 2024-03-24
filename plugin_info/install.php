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

require_once dirname(__FILE__) . '/../../../core/php/core.inc.php';

function mode_update() {
	foreach (mode::byType('mode') as $mode) {
		is_object($mode->getCmd(null, 'lock_state')) && $mode->setConfiguration('showLockCmd', '1');
		is_object($mode->getCmd(null, 'lock')) && $mode->setConfiguration('showLockCmd', '1');
		is_object($mode->getCmd(null, 'unlock')) && $mode->setConfiguration('showLockCmd', '1');
		is_object($mode->getCmd(null, 'replay')) && $mode->setConfiguration('showReplayCmd', '1');
		is_object($mode->getCmd(null, 'returnPreviousMode')) && $mode->setConfiguration('showPreviousCmd', '1');
		is_object($mode->getCmd(null, 'nextMode')) && $mode->setConfiguration('showNextCmd', '1');
		$mode->save();
	}
}
?>
