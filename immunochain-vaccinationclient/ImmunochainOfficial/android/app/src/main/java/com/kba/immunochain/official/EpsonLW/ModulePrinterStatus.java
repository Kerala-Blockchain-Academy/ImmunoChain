package com.kba.immunochain.official.EpsonLW;

import android.database.Cursor;
import android.os.AsyncTask;

import com.epson.lwprint.sdk.LWPrint;
import com.epson.lwprint.sdk.LWPrintDiscoverPrinter;
import com.epson.lwprint.sdk.LWPrintStatusError;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

public class ModulePrinterStatus extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    LWPrint lwprint;
    Map<String, Integer> lwStatus = null;
    Map<String, String> printerInfo = null;


    public ModulePrinterStatus(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        lwprint = new LWPrint(reactContext);

    }

    @Override
    public String getName() {
        return "PrinterStatus";
    }

    @ReactMethod
    public void getPrinterDetails(Callback successCallback) {

        new AsyncTask<Object, Object, Boolean>() {
            @Override
            protected Boolean doInBackground(Object... params) {
                try {
                    SQLiteDBHelper my_db = new SQLiteDBHelper(reactContext);
                    Cursor cursor = my_db.getPrinterDetails();
                    cursor.moveToFirst();
                    successCallback.invoke(cursor.getString(cursor.getColumnIndex("name")), cursor.getString(cursor.getColumnIndex("host")));
                } catch (Exception e) {

                    System.out.println(e);
                    successCallback.invoke("notAvailable","notAvailable");
                }
                return true;
            }


        }.execute();
    }

    @ReactMethod
    public void getStatus(Callback successCallback) {

        new AsyncTask<Object, Object, Boolean>() {
            @Override
            protected Boolean doInBackground(Object... params) {

                SQLiteDBHelper my_db = new SQLiteDBHelper(reactContext);
                Cursor cursor = my_db.getPrinterDetails();
                cursor.moveToFirst();
                if (printerInfo != null) {
                    printerInfo.clear();
                    printerInfo = null;
                }
                printerInfo = new HashMap<String, String>();
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_NAME, cursor.getString(cursor.getColumnIndex("name")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_PRODUCT, cursor.getString(cursor.getColumnIndex("product")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_USBMDL, cursor.getString(cursor.getColumnIndex("usbmdl")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_HOST, cursor.getString(cursor.getColumnIndex("host")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_PORT, cursor.getString(cursor.getColumnIndex("port")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_TYPE, cursor.getString(cursor.getColumnIndex("type")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_DOMAIN, cursor.getString(cursor.getColumnIndex("domain")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_SERIAL_NUMBER, cursor.getString(cursor.getColumnIndex("macaddress")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_DEVICE_CLASS, cursor.getString(cursor.getColumnIndex("deviceclass")));
                printerInfo.put(LWPrintDiscoverPrinter.PRINTER_INFO_DEVICE_STATUS, cursor.getString(cursor.getColumnIndex("devicestatus")));

                    try {
                        // Set printing information
                        lwprint.setPrinterInformation(printerInfo);

                        // Obtain printing status
                        lwStatus = lwprint.fetchPrinterStatus();
                        int deviceError = lwprint.getDeviceErrorFromStatus(lwStatus);
                        if (lwStatus.isEmpty() || (deviceError == LWPrintStatusError.ConnectionFailed)) {
                            successCallback.invoke("Not connected");
                            return true;
                        }
                        successCallback.invoke("Ready");
                    } catch (Exception e) {
                        successCallback.invoke("Not connected");
                        System.out.println(e);
                    }

                return true;
            }


        }.execute();
    }


}
