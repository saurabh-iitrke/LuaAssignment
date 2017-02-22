# Kamailio 4.4 Installation steps
1. apt-get update
2. apt-get install vim

install pre-required packages:

3. apt-get install git

4. apt-get install gcc

5. apt-get install flex

6. apt-get install bison

7. apt-get install make

8. apt-get install libpq-dev

* apt-get install libcurl4-openssl-dev

* apt-get install libssl-dev

* apt-get install libxml2-dev

* apt-get install libpcre3-dev

download kamailio in installation directory

9. mkdir -p /usr/local/src/kamailio-4.4

10. cd /usr/local/src/kamailio-4.4

11. git clone --depth 1 --no-single-branch https://github.com/kamailio/kamailio kamailio

12. cd kamailio

13. git checkout -b 4.4 origin/4.4

final installation steps

14. make cfg

15. vim modules.lst 

    Add/Replace following line in order to install kamailio with postgres module:
		
    include_modules= db_postgres
		
16. make all

17. make install

Configuration steps

18. echo $PATH 

    to check whether /usr/local/sbin is executable path or not. for my case it was there.
		
19. vim /usr/local/etc/kamailio/kamctlrc

    Add/Replace with following:
		
    a. DBENGINE=PGSQL
		
    b. DBHOST=localhost
		
    c. DBNAME=kamailio
		
    d. DBRWUSER="kamailio"
		
    e. DBRWPW="kamailiorw"
		
    f. DBROOTUSER="postgres"
		
20. cp /usr/local/src/kamailio-4.4/kamailio/pkg/kamailio/deb/debian/kamailio.service /etc/systemd/system/kamailio.service

21. chmod 755 /etc/systemd/system/kamailio.service

22. vim /etc/systemd/system/kamailio.service

    Add/Replace with following:
		
    a. Environment='CFGFILE=/usr/local/etc/kamailio/kamailio.cfg'
		
    b. Environment='USER=root'
	
    c. Environment='GROUP=root'
		
    d. ExecStart=/usr/local/sbin/kamailio
		
23. cp /usr/local/src/kamailio-4.4/kamailio/pkg/kamailio/deb/debian/kamailio.default /etc/default/kamailio

24. chmod 755 /etc/default/kamailio

25. vim /etc/default/kamailio

    Add/Replace following:
		
    a. RUN_KAMAILIO=yes
		
    b. USER=root
	
    c. GROUP=root
		
    d. SHM_MEMORY=64
		
    e. PKG_MEMORY=8
		
    f. CFGFILE=/usr/local/etc/kamailio/kamailio.cfg
		
    g. DUMP_CORE=yes
		
26. mkdir -p /var/run/kamailio

create logger file

27. vim /etc/rsyslog.conf

    Add following (remove '\'):
		
    local0.\*                 -/var/log/kamailio.log
		
28. service rsyslog restart

install postgresql

29. apt-get install postgresql postgresql-contrib

login as user postgres and create password

30. sudo -u postgres psql

31. alter user postgres password '123';

create kamailio tables in postgres

32. /usr/local/sbin/kamdbctl create

kamailio script changes(basic)

33. add following lines into the script:

    a. #!define WITH_PGSQL
		
    b. #!define WITH_AUTH
		
    c. #!define WITH_USRLOCDB
		
    d. #!define WITH_DEBUG
		
    e. #!ifdef WITH_PGSQL
		
	     #!define DBURL "postgres://kamailio:kamailiorw@localhost:5432/kamailio"
			 
	     #!endif
			 
    f. #!ifdef WITH_PGSQL
		
	     loadmodule "db_postgres.so"
			 
	     #!endif
			 
34. replace with following lines in script:

    a. log_stderror=no
		
    b. listen=udp:172.31.22.115:5060

start the kamailio server

35. service kamailio start

36. check for logs in: 

    /var/log/kamailio.log


# SIPp installation

install dependencies

1. apt-get install libncurses5-dev

2. apt-get install g++

main installation

3. cd /usr/local/src

4. wget https://downloads.sourceforge.net/project/sipp/sipp/3.4/sipp-3.3.990.tar.gz?r=https%3A%2F%2Fsourceforge.net%2Fprojects%2Fsipp%2Ffiles%2Fsipp%2F3.4%2F&ts=1487681143&use_mirror=excellmedia

5. mv sipp-3.3.990.tar.gz\?r\=https%3A%2F%2Fsourceforge.net%2Fprojects%2Fsipp%2Ffiles%2Fsipp%2F3.4%2F sipp-3.3.990.tar.gz

6. tar -xzf sipp-3.3.990.tar.gz

7. cd sipp-3.3.990

8. ./configure

9. make

Test Registration using SIPp

Add users in kamailio:

1. kamctl add 400@172.31.22.115 ttest1234

2. kamctl add 401@172.31.22.115 test1234

# Send REGISTER request to kamailio using SIPp script

1. create Scenario file: 
   
   Committed as register.xml
   
2. create injection file:
  
   Committed as register.csv
 
command to send register request:

1. cd /usr/local/src/sipp-3.3.990

2. ./sipp -sf tests_saurabh/register.xml -inf tests_saurabh/register.csv -i 172.31.22.115 172.31.22.115:5060 -m 2 -trace_msg

3. output can be seen in tests_saurabh folder. (latest file ex: register_pid_messages.log)


# Store the Value of X-DeviceID to location_attrs table

changes done in kamailio script are: 

1. modparam("usrloc", "xavp_contact", "ulattrs")      

   modparam("usrloc", "timer_interval", 30)           
   
2. In route[REGISTRAR] {

   $xavp(ulattrs=>device_id)=$hdr(X-DeviceID);
   
# NodeJS server to handle GET request

1. file server.js committed.

2. Added into crontab in server. 
  
   */1 * * * * /usr/bin/nodejs /usr/local/src/nodeserver/server.js
   
# kamailio script changes to Add RouteHeader in incoming INVITE as X-Route header

1. modparam("utils", "http_query_timeout", 2)    

2. if (is_method("INVITE|SUBSCRIBE")) {
      http_query("http://localhost:3001","$var(result)");
      jansson_get_field($var(result), "RouteHeader", "$var(foo)");
      xlog("L_INFO","@@@@@@@@@@@@@@@@@@@  RouteHeader is $var(foo)");
      append_hf("X-Route: $var(foo)\r\n");
   
# Create incoming call scenario

user 400(bob) will call to user 401(alice)

1. Scenario file committed: invite.xml

2. injection file committed: invite.csv

To test: 

1. Register them first
  
   a. cd /usr/local/src/sipp-3.3.990

   b. ./sipp -sf tests_saurabh/register.xml -inf tests_saurabh/register.csv -i 172.31.22.115 172.31.22.115:5060 -m 2 -trace_msg

2. Open a console (UAC i.e. bob): 

    a. cd /usr/local/src/sipp-3.3.990

    b. ./sipp -sf tests_saurabh/invite.xml -inf tests_saurabh/invite.csv -i 172.31.22.115 172.31.22.115:5060 -m 1 -trace_msg

3. Opens Second console (UAS i.e. alice)

   a. cd /usr/local/src/sipp-3.3.990
   
   b. ./sipp -sn uas 172.31.22.115:5060 -i 172.31.22.115 -trace_msg
   
4. packets can be checked in /usr/local/src/sipp-3.3.990/tests_saurabh folder for UAC (ex: invite_pid_messages.log)

   ex: see committed file: invite_uac_packet_capture.log

5. packets can be checked in /usr/local/src/sipp-3.3.990 folder for UAS (ex: uas_pid_messages.log)

   ex: see committed file: reply_uas_packet_capture.log
