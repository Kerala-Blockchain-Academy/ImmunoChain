package com.kba.immunochain.official;


import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.kba.immunochain.official.EpsonLW.ModuleFindPrinter;
import com.kba.immunochain.official.EpsonLW.ModulePrintQR;
import com.kba.immunochain.official.EpsonLW.ModulePrinterStatus;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CustomPackages implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new ModuleFindPrinter(reactContext));
        modules.add(new ModulePrinterStatus(reactContext));
        modules.add(new ModulePrintQR(reactContext));

        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();

    }
}

