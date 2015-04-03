// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
/// <reference path="../../../../typings/require.d.ts" />

import _Global = require('../Core/_Global');
import _WinRT = require('../Core/_WinRT');

"use strict";

var _Constants = {
    visualViewportClass: "win-visualviewport-space",
}

// This private module provides metrics accurate for the Visual Viewport and WWA's Soft Keyboard offsets in Win10 
// WWA where -ms-device-fixed CSS positioning is supported. WinJS controls continue to use this module for
// positoning themselves relative to the viewport in a web browser outside of WWA, and prefer to use -ms-device-fixed 
// positioning, but will fallback to fixed positioning when -ms-device-fixed is not supported.
// This module is not comatible for positining WinJS controls around the IHM in Win8 WWA because the IE10 
// enviornment does not support -ms-device-fixed positioning.
export interface IKeyboardInfo {
    _visible: boolean;
    _extraOccluded: number;
    _isResized: boolean;
    _visibleDocBottom: number;
    _visibleDocHeight: number;
    _visibleDocTop: number ;
    _visibleDocBottomOffset: number;
    _visualViewportHeight: number;
    _visualViewportWidth: number;
    _visualViewportSpace: ClientRect;
    _animationShowLength: number;
}

// WWA Soft Keyboard offsets
export var _KeyboardInfo: IKeyboardInfo = {
    // Determine if the keyboard is visible or not.
    get _visible(): boolean {

        try {
            return (
                _WinRT.Windows.UI.ViewManagement.InputPane &&
                _WinRT.Windows.UI.ViewManagement.InputPane.getForCurrentView().occludedRect.height > 0
                );
        } catch (e) {
            return false;
        }
    },

    // See if we have to reserve extra space for the IHM
    get _extraOccluded(): number {
        var occluded = 0;
        if (_WinRT.Windows.UI.ViewManagement.InputPane) {
            try {
                occluded = _WinRT.Windows.UI.ViewManagement.InputPane.getForCurrentView().occludedRect.height;
            } catch (e) {
            }
        }

        // Nothing occluded if not visible.
        if (occluded && !_KeyboardInfo._isResized) {
            // View hasn't been resized, need to return occluded height.
            return occluded;
        }

        // View already has space for keyboard or there's no keyboard
        return 0;

    },

    // See if the view has been resized to fit a keyboard
    get _isResized(): boolean {
        // Compare ratios.  Very different includes IHM space.
        var heightRatio = _Global.document.documentElement.clientHeight / _Global.innerHeight,
            widthRatio = _Global.document.documentElement.clientWidth / _Global.innerWidth;

        // If they're nearly identical, then the view hasn't been resized for the IHM
        // Only check one bound because we know the IHM will make it shorter, not skinnier.
        return (widthRatio / heightRatio < 0.99);

    },

    // Get the bottom of our visible area.
    get _visibleDocBottom():number {
        return _KeyboardInfo._visibleDocTop + _KeyboardInfo._visibleDocHeight;

    },

    // Get the height of the visible document, e.g. the height of the visual viewport minus any IHM occlusion.
    get _visibleDocHeight():number {
        return _KeyboardInfo._visualViewportHeight - _KeyboardInfo._extraOccluded;
    },

    // Get the top offset of our visible area, aka the top of the visual viewport.
    // This is always 0 when _Overlay elements use -ms-device-fixed positioning.
    get _visibleDocTop(): number {
        return 0;
    },

    // Get the bottom offset of the visual viewport, plus any IHM occlusion.
    get _visibleDocBottomOffset(): number {
        // For -ms-device-fixed positioned elements, the bottom is just 0 when there's no IHM.
        // When the IHM appears, the text input that invoked it may be in a position on the page that is occluded by the IHM.
        // In that instance, the default browser behavior is to resize the visual viewport and scroll the input back into view.
        // However, if the viewport resize is prevented by an IHM event listener, the keyboard will still occlude
        // -ms-device-fixed elements, so we adjust the bottom offset of the appbar by the height of the occluded rect of the IHM.
        return (_KeyboardInfo._isResized) ? 0 : _KeyboardInfo._extraOccluded;
    },

    // Get the visual viewport height. window.innerHeight doesn't return floating point values which are present with high DPI.
    get _visualViewportHeight(): number {
        var boundingRect = _KeyboardInfo._visualViewportSpace;
        return boundingRect.height;
    },

    // Get the visual viewport width. window.innerWidth doesn't return floating point values which are present with high DPI.
    get _visualViewportWidth(): number {
        var boundingRect = _KeyboardInfo._visualViewportSpace;
        return boundingRect.width;
    },

    get _visualViewportSpace(): ClientRect {
        var visualViewportSpace: HTMLElement = <HTMLElement>_Global.document.body.querySelector("." + _Constants.visualViewportClass);
        if (!visualViewportSpace) {
            visualViewportSpace = _Global.document.createElement("DIV");
            visualViewportSpace.className = _Constants.visualViewportClass;
            _Global.document.body.appendChild(visualViewportSpace);
        }
        return visualViewportSpace.getBoundingClientRect();
    },

    // Get total length of the IHM showPanel animation
    get _animationShowLength(): number {
        if (_WinRT.Windows.UI.Core.AnimationMetrics) {
            var a = _WinRT.Windows.UI.Core.AnimationMetrics,
                animationDescription = new a.AnimationDescription(a.AnimationEffect.showPanel, a.AnimationEffectTarget.primary);
            var animations = animationDescription.animations;
            var max = 0;
            for (var i = 0; i < animations.size; i++) {
                var animation = animations[i];
                max = Math.max(max, animation.delay + animation.duration);
            }
            return max;
        } else {
            return 0;
        }
    },
};
