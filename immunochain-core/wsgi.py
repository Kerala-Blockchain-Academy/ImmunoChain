import sys
import logging

from server import app as application

gunicorn_error_logger = logging.getLogger('gunicorn.error')
application.logger.handlers.extend(gunicorn_error_logger.handlers)
application.logger.setLevel(logging.DEBUG)
application.logger.debug('this will show in the log')


if  __name__ == "__main__":
     application.run(debug=True)


