/*
 * DeviceInfo.java
 *
 * Project: LW-Print SDK
 *
 * Contains: DeviceInfo class
 *
 * Copyright (C) 2013-2019 SEIKO EPSON CORPORATION. All Rights Reserved.
 */
package com.kba.immunochain.official.EpsonLW;


public class PrinterInfo {
    private String name;
    private String product;
    private String usbmdl;
    private String host;
    private String port;
    private String type;
    private String domain;
    private String macaddress;
    private String deviceclass;
    private String devicestatus;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    public String getUsbmdl() {
        return usbmdl;
    }

    public void setUsbmdl(String usbmdl) {
        this.usbmdl = usbmdl;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getMacaddress() {
        return macaddress;
    }

    public void setMacaddress(String macaddress) {
        this.macaddress = macaddress;
    }

    public String getDeviceClass() {
        return deviceclass;
    }

    public void setDeviceClass(String deviceclass) {
        this.deviceclass = deviceclass;
    }

    public String getDeviceStatus() {
        return devicestatus;
    }

    public void setDeviceStatus(String devicestatus) {
        this.devicestatus = devicestatus;
    }

}

