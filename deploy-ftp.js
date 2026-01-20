const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();
require('dotenv').config();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT || 21,
  localRoot: __dirname + '/dist/cedemusa',
  remoteRoot: process.env.FTP_REMOTE_ROOT || '/public_html',
  include: ['*', '**/*'],
  exclude: ['assets/img/**'],
  deleteRemote: false,
  forcePasv: true,
  sftp: false
};

console.log('\n🚀 Iniciando deployment a Hostinger...\n');

ftpDeploy
  .deploy(config)
  .then(res => {
    console.log('\n✅ Deployment completado exitosamente!');
    console.log(`📁 Archivos subidos: ${res.length}`);
  })
  .catch(err => {
    console.error('\n❌ Error durante el deployment:', err);
    process.exit(1);
  });

ftpDeploy.on('uploading', data => {
  const percentage = ((data.transferredFileCount / data.totalFilesCount) * 100).toFixed(2);
  console.log(`📤 Subiendo [${percentage}%]: ${data.filename}`);
});

ftpDeploy.on('uploaded', data => {
  console.log(`✓ Completado: ${data.filename}`);
});

ftpDeploy.on('log', data => {
  console.log(`ℹ️  ${data}`);
});
