from backEnd import DB_Initiator, login
import subprocess
DB_Initiator.init()
login.run()
# subprocess.run(['C:\\Users\\kjh15\\AppData\\Roaming\\npm\\npm.cmd', 'run', 'build'], check=True,cwd ="Code\\frontEnd")