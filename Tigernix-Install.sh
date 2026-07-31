echo "Intalling and setting up postgres"
sudo apt install postgresql
sudo su postgres -c "createuser $(whoami)"
sudo -u postgres psql -c "alter Role ubuntu with SUPERUSER CREATEROLE CREATEDB"

echo "Intalling python package"
sudo apt-get install python3-babel python3-dateutil python3-decorator python3-docutils python3-feedparser python3-gevent python3-html2text python3-jinja2 python3-libsass python3-lxml python3-mock python3-ofxparse python3-passlib python3-polib python3-psutil python3-psycopg2 python3-pydot python3-pyparsing python3-pypdf2 python3-qrcode python3-serial python3-usb python3-vatnumber python3-vobject python3-werkzeug python3-xlsxwriter python3-zeep postgresql-client python3-suds python3-xlrd
