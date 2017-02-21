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
    
