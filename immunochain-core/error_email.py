import smtplib, ssl
import threading

smtp_server = "smtp.gmail.com"
port = 587  # For starttls
sender_email = "dees10986@gmail.com"
password = "deepushaji44"
context = ssl.create_default_context()
emails = ["rishal.ep@iiitmk.ac.in",
"lakshmi.r@iiitmk.ac.in",
"deepu.shaji@iiitmk.ac.in",
"athul.ramesh@iiitmk.ac.in",
"muhzin.vs@iiitmk.ac.in",
"shon.joseph@iiitmk.ac.in"]



def mail(receiver_email,message):
    try:
        server = smtplib.SMTP(smtp_server, port)
        server.starttls(context=context)
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message)
        server.close()
    except Exception as e:
        server.close()



def send_email(error):

    message = """\
Subject: ImmunoChain Error Email Alert!!!

Error is: """+str(error)
    try:

        data = [["deepu.shaji@iiitmk.ac.in",message],["athul.ramesh@iiitmk.ac.in",message],["muhzin.vs@iiitmk.ac.in",message],["shon.joseph@iiitmk.ac.in",message],["rishal.ep@iiitmk.ac.in",message], ["lakshmi.r@iiitmk.ac.in",message]]
        for d in data:
            thread = threading.Thread(target=mail, args=(d[0], d[1]))
            thread.start()
    except Exception as e:
        print(e)
