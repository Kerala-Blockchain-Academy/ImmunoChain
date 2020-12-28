package com.kba.immunochain.official.EpsonLW;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class SQLiteDBHelper extends SQLiteOpenHelper {
    SQLiteDatabase db;

    //database name
    private static final String DATABASE_NAME = "Immunichain.db";

    //database version
    private static final int DATABASE_VERSION = 1;

    //creating book_table
    // query for creating table
    public static final String PRINTER_TABLE_NAME = "tbl_selectedPrinter";
    public static final String PRINTER_ID =  "_id";
    public static final String PRINTER_NAME=  "name";
    public static final String PRINTER_PRODUCT=  "product";
    public static final String PRINTER_USBMDL=  "usbmdl";
    public static final String PRINTER_HOST=  "host";
    public static final String PRINTER_PORT=  "port";
    public static final String PRINTER_TYPE=  "type";
    public static final String PRINTER_DOMAIN=  "domain";
    public static final String PRINTER_MACADDRESS=  "macaddress";
    public static final String PRINTER_DEVICECLASS=  "deviceclass";
    public static final String PRINTER_DEVICESTATUS=  "devicestatus";


    public static final String CREATE_PRINTER_TABLE_QUERY =
            "CREATE TABLE " + PRINTER_TABLE_NAME + "(" +
                    PRINTER_ID + " INTEGER , " +
                    PRINTER_NAME+ " TEXT, " +
                    PRINTER_PRODUCT+ " TEXT, " +
                    PRINTER_USBMDL+ " TEXT, " +
                    PRINTER_HOST+ " TEXT, " +
                    PRINTER_PORT+ " TEXT, " +
                    PRINTER_TYPE+ " TEXT, " +
                    PRINTER_DOMAIN+ " TEXT, " +
                    PRINTER_MACADDRESS+ " TEXT, " +
                    PRINTER_DEVICECLASS+ " TEXT, " +
                    PRINTER_DEVICESTATUS+ " TEXT " + ")";
    //end creating book_table



    //modified constructor
    //initializing class
    public SQLiteDBHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        db = this.getWritableDatabase();
    }
    @Override
    public void onCreate(SQLiteDatabase sqLiteDatabase) {
        try {
            sqLiteDatabase.execSQL(CREATE_PRINTER_TABLE_QUERY);

            sqLiteDatabase.execSQL("insert into tbl_selectedPrinter(_id,name,product,usbmdl,host,port,type,domain,macaddress,deviceclass,devicestatus) values(1,'notAvailable','','','notAvailable','','','','','','')");
            System.out.println("DB Check");
        }catch(Exception e){
            System.out.println(e);
        }
    }

    @Override
    public void onUpgrade(SQLiteDatabase sqLiteDatabase, int oldVersion, int newVersion) {
        sqLiteDatabase.execSQL("drop table if EXISTS "  + PRINTER_TABLE_NAME );
        onCreate(sqLiteDatabase);
    }

    public void setPrinter(String name,String product,String usbmdl,String host,String port,String type,String domain,String macaddress,String deviceclass,String devicestatus){

        ContentValues contentValues = new ContentValues();
        contentValues.put(PRINTER_ID ,1);
        contentValues.put(PRINTER_NAME,name);
        contentValues.put(PRINTER_PRODUCT,product);
        contentValues.put(PRINTER_USBMDL,usbmdl);
        contentValues.put(PRINTER_HOST,host);
        contentValues.put(PRINTER_PORT,port);
        contentValues.put(PRINTER_TYPE,type);
        contentValues.put(PRINTER_DOMAIN,domain);
        contentValues.put(PRINTER_MACADDRESS,macaddress);
        contentValues.put(PRINTER_DEVICECLASS,deviceclass);
        contentValues.put(PRINTER_DEVICESTATUS,devicestatus);
        db.update(SQLiteDBHelper.PRINTER_TABLE_NAME,contentValues,"_id=1",null);
    }
    public Cursor getPrinterDetails() {
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor data = db.rawQuery("select * from tbl_selectedPrinter where _id=1;", null);
        return data;
    }
}
