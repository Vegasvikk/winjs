// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
///<reference path="Helper.ts" />
///<reference path="../TestLib/winjs.dev.d.ts" />

module Helper.AppBar {
    "use strict";

    var _Constants = Helper.require("WinJS/Controls/AppBar/_Constants");
    var _CommandingSurfaceConstants = Helper.require("WinJS/Controls/CommandingSurface/_Constants");
    var _CommandingSurface = <typeof WinJS.UI.PrivateCommandingSurface> Helper.require("WinJS/Controls/CommandingSurface/_CommandingSurface")._CommandingSurface;

    export function verifyRenderedOpened(appBar: WinJS.UI.PrivateAppBar): void {

        var commandingSurfaceTotalHeight = WinJS.Utilities.getTotalHeight(appBar._dom.commandingSurfaceEl);
        var commandingSurfaceTotalWidth = WinJS.Utilities.getTotalWidth(appBar._dom.commandingSurfaceEl);

        var appBarEl = appBar.element;
        var appBarContentHeight = WinJS.Utilities.getContentHeight(appBarEl);
        var appBarContentWidth = WinJS.Utilities.getContentWidth(appBarEl);

        // Verify that the Opened AppBar contentbox size matches its CommandingSurface's marginbox size.
        LiveUnit.Assert.areEqual(appBarContentHeight, commandingSurfaceTotalHeight, "Opened AppBar contentbox height should size to content.");
        LiveUnit.Assert.areEqual(appBarContentWidth, commandingSurfaceTotalWidth, "Opened AppBar contentbox width should size to content.");

        Helper._CommandingSurface.verifyRenderedOpened(appBar._commandingSurface);
    }

    export function verifyRenderedClosed(appBar: WinJS.UI.PrivateAppBar): void {

        var appBarContentHeight = WinJS.Utilities.getContentHeight(appBar.element),
            appBarContentWidth = WinJS.Utilities.getContentWidth(appBar.element),
            commandingSurfaceTotalHeight = WinJS.Utilities.getTotalHeight(appBar._dom.commandingSurfaceEl),
            commandingSurfaceTotalWidth = WinJS.Utilities.getTotalWidth(appBar._dom.commandingSurfaceEl);

        if (appBar.closedDisplayMode === WinJS.UI.AppBar.ClosedDisplayMode.none) {
            LiveUnit.Assert.areEqual("none", getComputedStyle(appBar.element).display, "Closed AppBar with closedDisplayMode 'none' should not display");
        } else {
            // Verify that the Closed AppBar content size matches its CommandingSurface's total size.
            LiveUnit.Assert.areEqual(appBarContentHeight, commandingSurfaceTotalHeight, "Closed AppBar contentbox height should size to content.");
            LiveUnit.Assert.areEqual(appBarContentWidth, commandingSurfaceTotalWidth, "Closed AppBar contentbox width should size to content.");
        }
        // Verify CommandingSurface rendered closed.
        Helper._CommandingSurface.verifyRenderedClosed(appBar._commandingSurface);
    }

    export function verifyPlacementProperty(appBar: WinJS.UI.PrivateAppBar): void {

        var placement = appBar.placement;
        var topOfViewPort = 0;
        var bottomOfViewPort = window.innerHeight;
        var tolerance = 1;
        var appBarRect = appBar._dom.root.getBoundingClientRect();
        var appBarStyle = getComputedStyle(appBar.element);
        var marginTop = WinJS.Utilities.convertToPixels(appBar.element, appBarStyle.marginTop);
        var marginBottom = WinJS.Utilities.convertToPixels(appBar.element, appBarStyle.marginBottom);

        switch (placement) {
            case WinJS.UI.AppBar.Placement.top:
                Helper.Assert.areFloatsEqual(topOfViewPort, appBarRect.top - marginTop, "", 1);
                LiveUnit.Assert.areEqual(appBar._commandingSurface.overflowDirection, _CommandingSurface.OverflowDirection.bottom, "Top AppBar should overflow towards the bottom");
                break;

            case WinJS.UI.AppBar.Placement.bottom:
                Helper.Assert.areFloatsEqual(bottomOfViewPort, appBarRect.bottom + marginBottom, "", 1);
                LiveUnit.Assert.areEqual(appBar._commandingSurface.overflowDirection, _CommandingSurface.OverflowDirection.top, "Bottom AppBar should overflow towards the top");
                break;

            default:
                LiveUnit.Assert.fail("TEST ERROR: Encountered unknown Placement enum value: " + placement);
                break;
        }

    }

    export function useSynchronousAnimations(appBar: WinJS.UI.PrivateAppBar) {
        Helper._CommandingSurface.useSynchronousAnimations(appBar._commandingSurface);
    }

}