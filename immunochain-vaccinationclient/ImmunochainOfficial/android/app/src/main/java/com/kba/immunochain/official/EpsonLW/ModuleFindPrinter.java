package com.kba.immunochain.official.EpsonLW;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;


import androidx.annotation.Nullable;

import com.epson.lwprint.sdk.LWPrintDiscoverConnectionType;
import com.epson.lwprint.sdk.LWPrintDiscoverPrinter;
import com.epson.lwprint.sdk.LWPrintDiscoverPrinterCallback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import static android.content.ContentValues.TAG;

public class ModuleFindPrinter extends ReactContextBaseJavaModule implements LWPrintDiscoverPrinterCallback {
    LWPrintDiscoverPrinter lpPrintDiscoverPrinter;
    private static ReactApplicationContext reactContext;
    private String type = "_pdl-datastream._tcp.local.";
    List<String> dataList = new ArrayList<String>();
    List<PrinterInfo> deviceList = new ArrayList<PrinterInfo>();

    SQLiteOpenHelper dbhelper;
    SQLiteDatabase db;

    public ModuleFindPrinter(ReactApplicationContext context) {
        super(context);
        reactContext = context;

        //Opening SQLite Pipeline
        dbhelper = new SQLiteDBHelper(reactContext);
        db = dbhelper.getReadableDatabase();
    }

    @Override
    public String getName() {
        return "FindPrinter";
    }

    @ReactMethod
    public void discover(Callback successCallback) {
        try {
            // Create LWPrintDiscoverPrinter
            List<String> typeList = new ArrayList<String>();
            typeList.add(type);

            // Search Wi-Fi network connection
            List<String> modelNames = new ArrayList<String>(Arrays.asList("(EPSON LW-1000P)"));
            EnumSet<LWPrintDiscoverConnectionType> flag = EnumSet.of(LWPrintDiscoverConnectionType.ConnectionTypeNetwork);
            lpPrintDiscoverPrinter = new LWPrintDiscoverPrinter(typeList, modelNames, flag);

            // Sets the callback
            lpPrintDiscoverPrinter.setCallback(this);
            // Starts discovery
            lpPrintDiscoverPrinter.startDiscover(reactContext);

            successCallback.invoke("Search initiated");
        } catch (Exception e) {
            Log.d(TAG, e.getMessage());
            successCallback.invoke("Search failed");

        }
    }

    @ReactMethod
    public void selectPrinter(Integer printerIndex, Callback successCallback) {
        try {
            SQLiteDBHelper my_db = new SQLiteDBHelper(reactContext);

            String p_name = (deviceList.get(printerIndex).getName() != null ? deviceList.get(printerIndex).getName() : "");
            String p_product = (deviceList.get(printerIndex).getProduct() != null ? deviceList.get(printerIndex).getProduct() : "");
            String p_usbmdl = (deviceList.get(printerIndex).getUsbmdl() != null ? deviceList.get(printerIndex).getUsbmdl() : "");
            String p_host = (deviceList.get(printerIndex).getHost() != null ? deviceList.get(printerIndex).getHost() : "");
            String p_port = (deviceList.get(printerIndex).getPort() != null ? deviceList.get(printerIndex).getPort() : "");
            String p_type = (deviceList.get(printerIndex).getType() != null ? deviceList.get(printerIndex).getType() : "");
            String p_domain = (deviceList.get(printerIndex).getDomain() != null ? deviceList.get(printerIndex).getDomain() : "");
            String p_macaddress = (deviceList.get(printerIndex).getMacaddress() != null ? deviceList.get(printerIndex).getMacaddress() : "");
            String p_deviceclass = (deviceList.get(printerIndex).getDeviceClass() != null ? deviceList.get(printerIndex).getDeviceClass() : "");
            String p_devicestatus = (deviceList.get(printerIndex).getDeviceStatus() != null ? deviceList.get(printerIndex).getDeviceStatus() : "");

            System.out.println(p_name+"-"+p_product+"-"+p_host);
            my_db.setPrinter(p_name, p_product, p_usbmdl, p_host, p_port, p_type, p_domain, p_macaddress, p_deviceclass, p_devicestatus);


            if (lpPrintDiscoverPrinter != null) {
                // Stops discovery
                lpPrintDiscoverPrinter.stopDiscover();
                lpPrintDiscoverPrinter = null;
            }
            successCallback.invoke("Printer selected");
        } catch (Exception e) {
            Log.d(TAG, e.getMessage());
            successCallback.invoke("Printer selection failed");

        }
    }

    @ReactMethod
    public void cancelSearch(Callback successCallback) {
        try {
            if (lpPrintDiscoverPrinter != null) {
                // Stops discovery
                lpPrintDiscoverPrinter.stopDiscover();
                lpPrintDiscoverPrinter = null;
            }
            successCallback.invoke("Search cancelled");
        } catch (Exception e) {
            Log.d(TAG, e.getMessage());
            successCallback.invoke("Cancellation failed");

        }
    }


    @Override
    public void onFindPrinter(LWPrintDiscoverPrinter lwPrintDiscoverPrinter, Map<String, String> printer) {
        // Called when printers are detected
        for (PrinterInfo info : deviceList) {
            if (info.getName().equals(printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_NAME))
                    && info.getHost().equals(printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_HOST))
                    && info.getMacaddress().equals(printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_SERIAL_NUMBER))) {
                return;
            }
        }

        String type = (String) printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_TYPE);
        String status = (String) printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_DEVICE_STATUS);

        PrinterInfo obj = new PrinterInfo();
        obj.setName((String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_NAME));
        obj.setProduct((String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_PRODUCT));
        obj.setUsbmdl((String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_USBMDL));
        obj.setHost((String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_HOST));
        obj.setPort((String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_PORT));
        obj.setType(type);
        obj.setDomain((String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_DOMAIN));
        obj.setMacaddress((String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_SERIAL_NUMBER));
        obj.setDeviceClass((String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_DEVICE_CLASS));
        obj.setDeviceStatus(status);

        deviceList.add(obj);

        if (TextUtils.isEmpty(obj.getMacaddress())) {
            // Wi-Fi
            String printerItem = "{\"name\":\"" +
                    printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_NAME) +
                    "\",\"host\":\"" +
                    printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_HOST) +
                    "\",\"type\":\"" +
                    printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_TYPE) +
                    "\"}";
            dataList.add(printerItem);
            triggerListener();
        } else {
            // Wi-Fi Direct
            int deviceStatus = -1;
            try {
                deviceStatus = Integer.parseInt(status);
            } catch (NumberFormatException e) {
            }
            String printerItem = "{\"name\":" +
                    printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_NAME) +
                    ",\"host\":" +
                    printer.get(LWPrintDiscoverPrinter.PRINTER_INFO_SERIAL_NUMBER) +
                    ",\"type\":" +
                    getDeviceStatusForWifiDirect(deviceStatus) +
                    "}";
            dataList.add(printerItem);

            triggerListener();
        }
    }

    @Override
    public void onRemovePrinter(LWPrintDiscoverPrinter lwPrintDiscoverPrinter, Map<String, String> printer) {
        String name = (String) printer
                .get(LWPrintDiscoverPrinter.PRINTER_INFO_NAME);
        int index = -1;
        for (int i = 0; i < deviceList.size(); i++) {
            PrinterInfo info = deviceList.get(i);
            if (name.equals(info.getName())) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            deviceList.remove(index);
            dataList.remove(index);
            triggerListener();
        }
    }


    private String getDeviceStatusForWifiDirect(int deviceStatus) {
        switch (deviceStatus) {
            case 0:
                return "Connected";
            case 1:
                return "Invited";
            case 2:
                return "Failed";
            case 3:
                return "Available";
            case 4:
                return "Unavailable";
            default:
                return "Unknown";
        }
    }

    private void triggerListener() {
        String finalList = "[";
        String info;
        String data;

        for (int i = 0; i < dataList.size(); i++) {
            if (i != 0) finalList += ",";
            info = dataList.get(i);
            data = "{\"index\":" + i + ",\"data\":" + info + "}";
            finalList += data;
        }
        finalList += "]";

        WritableMap params = Arguments.createMap();
        params.putString("List", finalList);

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("PrinterList", params);
    }
}
