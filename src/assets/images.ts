// Importações diretas das imagens para garantir que sejam incluídas no bundle
import gs300 from './gs300.png';
import d2 from './d2.jpg';
import totem from './totem.png';
import rede from './rede.png';
import raspberryServer from './raspberryServer.jpeg';

export const equipmentImages = {
  androidPdvGertec: gs300,
  androidPdvSunmi: d2,
  selfServiceTotemGertec: totem,
  networkKit: rede,
  raspberryServer: raspberryServer,
  elginM10Pro: raspberryServer, // Usando imagem existente como placeholder
  tancaTp650: raspberryServer, // Usando imagem existente como placeholder
  impressoraFiscal: raspberryServer, // Usando imagem existente como placeholder
  leitorCodigoBarras: raspberryServer, // Usando imagem existente como placeholder
  gaveta: raspberryServer, // Usando imagem existente como placeholder
};

export default equipmentImages;