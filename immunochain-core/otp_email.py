import server_config
import requests

def send_email(phone,otp):


    try:
        message = "OTP for ImmunoChain Authentication is : "+str(otp)
        requests.get(server_config.Config["XPRESS_SMS"].format(message, phone))
    except Exception as e:
        # Print any error messages to stdout
        print(str(e))
