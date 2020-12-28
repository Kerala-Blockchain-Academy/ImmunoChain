package com.kba.immunochain.official.EpsonLW;


import android.content.res.AssetManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.util.Log;

import com.epson.lwprint.sdk.LWPrint;
import com.epson.lwprint.sdk.LWPrintCallback;
import com.epson.lwprint.sdk.LWPrintConnectionStatus;
import com.epson.lwprint.sdk.LWPrintDataProvider;
import com.epson.lwprint.sdk.LWPrintDiscoverPrinter;
import com.epson.lwprint.sdk.LWPrintParameterKey;
import com.epson.lwprint.sdk.LWPrintPrintingPhase;
import com.epson.lwprint.sdk.LWPrintStatusError;
import com.epson.lwprint.sdk.LWPrintTapeCut;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;


import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import static android.content.ContentValues.TAG;


public class ModulePrintQR extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private boolean processing = false;
    Map<String, String> printerInfo = null;

    public enum FormType {
        String,
        QRCode
    }

    LWPrint lwprint;
    Map<String, Integer> lwStatus = null;
    SampleDataProvider sampleDataProvider;
    PrintCallback printListener;

    public ModulePrintQR(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        lwprint = new LWPrint(reactContext);
        sampleDataProvider = new SampleDataProvider();
        lwprint.setCallback(printListener = new PrintCallback());


    }

    @Override
    public String getName() {
        return "PrintQR";
    }

    @ReactMethod
    public void print(String inputData, Callback successCallback) {
        try {
            sampleDataProvider.setQrCodeData(inputData);

            SQLiteDBHelper my_db = new SQLiteDBHelper(reactContext);
            Cursor cursor = my_db.getPrinterDetails();
            cursor.moveToFirst();
            if ((!cursor.getString(cursor.getColumnIndex("name")).equals("notAvailable"))  ) {

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

                setProcessing(true);
                successCallback.invoke("Printing initiated");

                performPrint();
            }else {
                successCallback.invoke("Printer not configured");

            }
        } catch (Exception e) {
            Log.d(TAG, e.getMessage());
            successCallback.invoke("Something went wrong. Printing not initiated");

        }

    }

    private void setProcessing(final Boolean mode) {
        processing = mode;
    }

    public void printComplete(int connectionStatus, int status, boolean suspend) {
        String msg = "";
        if (connectionStatus == LWPrintConnectionStatus.NoError && status == LWPrintStatusError.NoError) {
            msg = "Print Complete.";
        } else {
            if (suspend) {
                msg = "Print Error Re-Print [" + Integer.toHexString(status)
                        + "].";
            } else {
                msg = "Print Error [" + Integer.toHexString(status) + "].";
            }
        }
        System.out.println(msg);


    }

    private void performPrint() {
        if (printerInfo == null) {
            setProcessing(false);
            return;
        }

        new AsyncTask<Object, Object, Boolean>() {
            @Override
            protected Boolean doInBackground(Object... params) {
                // Set printing information
                lwprint.setPrinterInformation(printerInfo);

                // Obtain printing status
                lwStatus = lwprint.fetchPrinterStatus();
                int deviceError = lwprint.getDeviceErrorFromStatus(lwStatus);
                if (lwStatus.isEmpty() || (deviceError == LWPrintStatusError.ConnectionFailed)) {
                    WritableMap eventParams = Arguments.createMap();
                    eventParams.putString("Status", "Printer offline");
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("PrinterResponce", params);
                    return false;
                }

                // Make a print parameter
                int tapeWidth = lwprint.getTapeWidthFromStatus(lwStatus);

                Map<String, Object> printParameter = new HashMap<String, Object>();
                // Number of copies(1 ... 99)
                printParameter.put(LWPrintParameterKey.Copies, 1);
                // Tape cut method(LWPrintTapeCut)
                printParameter.put(LWPrintParameterKey.TapeCut, LWPrintTapeCut.EachLabel);
                // Set half cut (true:half cut on)
                printParameter.put(LWPrintParameterKey.HalfCut, true);
                // Low speed print setting (true:low speed print on)
                printParameter.put(LWPrintParameterKey.PrintSpeed, false);
                // Print density(-5 ... 5)
                printParameter.put(LWPrintParameterKey.Density, 0);
                // Tape width(LWPrintTapeWidth)
                printParameter.put(LWPrintParameterKey.TapeWidth, tapeWidth);


                sampleDataProvider.setFormType(FormType.QRCode);
                lwprint.doPrint(sampleDataProvider, printParameter);


                return true;
            }

            @Override
            protected void onPostExecute(Boolean result) {
                if (result == false) {
                    setProcessing(false);

                }
            }
        }.execute();

    }

    class SampleDataProvider implements LWPrintDataProvider {

        private static final String FORM_DATA_QRCODE = "FormDataQRCode.plist";

        private FormType formType = FormType.String;
        private String stringData = "String";
        private String qrCodeData = "QRCode";

        InputStream formDataStringInputStream;
        InputStream formDataQRCodeInputStream;

        public FormType getFormType() {
            return formType;
        }

        public void setFormType(FormType formType) {
            this.formType = formType;
        }

        public String getStringData() {
            return stringData;
        }

        public void setStringData(String stringData) {
            this.stringData = stringData;
        }

        public String getQrCodeData() {
            return qrCodeData;
        }

        public void setQrCodeData(String qrCodeData) {
            this.qrCodeData = qrCodeData;
        }

        public void closeStreams() {
            if (formDataStringInputStream != null) {
                try {
                    formDataStringInputStream.close();
                } catch (IOException e) {
                    System.out.println(e);
                }
                formDataStringInputStream = null;
            }
            if (formDataQRCodeInputStream != null) {
                try {
                    formDataQRCodeInputStream.close();
                } catch (IOException e) {
                    System.out.println(e);
                }
                formDataQRCodeInputStream = null;
            }
        }

        @Override
        public void startOfPrint() {
            // It is called only once when printing started
            System.out.println("startOfPrint");
        }

        @Override
        public void endOfPrint() {
            // It is called only once when printing finished
            System.out.println("endOfPrint");
        }

        @Override
        public void startPage() {
            // It is called when starting a page
            System.out.println("startPage");
        }

        @Override
        public void endPage() {
            // It is called when finishing a page
            System.out.println("endPage");
        }

        @Override
        public int getNumberOfPages() {
            // Return all pages printed
            System.out.println("getNumberOfPages");
            return 1;
        }

        @Override
        public InputStream getFormDataForPage(int pageIndex) {
            // Return the form data for pageIndex page
            System.out.println("getFormDataForPage: pageIndex=" + pageIndex);

            InputStream formData = null;


            System.out.println("QRCode: pageIndex=" + pageIndex);
            if (formDataQRCodeInputStream != null) {
                try {
                    formDataQRCodeInputStream.close();
                } catch (IOException e) {
                    System.out.println(e);
                }
                formDataQRCodeInputStream = null;
            }
            try {
                AssetManager as = reactContext.getResources().getAssets();
                formDataQRCodeInputStream = as.open(FORM_DATA_QRCODE);
                formData = formDataQRCodeInputStream;
//                        System.out.println("getFormDataForPage: " + FORM_DATA_QRCODE + "=" + formDataStringInputStream.available());
            } catch (IOException e) {
                System.out.println(e);
            }

            return formData;
        }

        @Override
        public String getStringContentData(String contentName, int pageIndex) {
            // Return the data for the contentName of the pageIndex page
            System.out.println("getStringContentData: contentName=" + contentName
                    + ", pageIndex=" + pageIndex);

            if ("String".equals(contentName)) {
                return stringData;
            } else if ("QRCode".equals(contentName)) {
                return qrCodeData;
            }

            return null;
        }

        @Override
        public Bitmap getBitmapContentData(String contentName, int pageIndex) {
            // Return the data for the contentName of the pageIndex page
            System.out.println("getBitmapContentData: contentName=" + contentName
                    + ", pageIndex=" + pageIndex);

            return null;
        }

    }

    class PrintCallback implements LWPrintCallback {

        @Override
        public void onChangePrintOperationPhase(LWPrint lWPrint, int phase) {
            // Report the change of a printing phase
            System.out.println("onChangePrintOperationPhase: phase=" + phase);
            String jobPhase = "";
            WritableMap params = Arguments.createMap();

            switch (phase) {
                case LWPrintPrintingPhase.WaitingForPrint:
                    jobPhase = "Processing print";
                    System.out.println("phase=" + jobPhase);
                    params.putString("Status", jobPhase);
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("PrinterResponce", params);
                    break;
                case LWPrintPrintingPhase.Complete:
                    jobPhase = "Printing completed";
                    System.out.println("phase=" + jobPhase);
                    params.putString("Status", jobPhase);
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("PrinterResponce", params);
                    printComplete(LWPrintConnectionStatus.NoError, LWPrintStatusError.NoError, false);
                    setProcessing(false);
                    break;
                default:
                    setProcessing(false);
                    break;
            }

        }

        @Override
        public void onChangeTapeFeedOperationPhase(LWPrint lWPrint, int phase) {
            // Called when tape feed and tape cutting state transitions
            System.out.println("onChangeTapeFeedOperationPhase: phase=" + phase);
        }

        @Override
        public void onAbortPrintOperation(LWPrint lWPrint, int errorStatus,
                                          int deviceStatus) {
            // It is called when undergoing a transition to the printing cancel operation due to a printing error
            System.out.println("onAbortPrintOperation: errorStatus=" + errorStatus
                    + ", deviceStatus=" + deviceStatus);

            printComplete(errorStatus, deviceStatus, false);

            setProcessing(false);


        }

        @Override
        public void onSuspendPrintOperation(LWPrint lWPrint, int errorStatus,
                                            int deviceStatus) {
            // It is called when undergoing a transition to the printing restart operation due to a printing error
            System.out.println("onSuspendPrintOperation: errorStatus=" + errorStatus
                    + ", deviceStatus=" + deviceStatus);

            printComplete(errorStatus, deviceStatus, true);


        }

        @Override
        public void onAbortTapeFeedOperation(LWPrint lWPrint, int errorStatus,
                                             int deviceStatus) {
            // Called when tape feed and tape cutting stops due to an error
            System.out.println("errorStatus=" + errorStatus + ", deviceStatus=" + deviceStatus);
        }

    }
}
