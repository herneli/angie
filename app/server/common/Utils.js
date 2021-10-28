export default class Utils {

    parseToken(data) {
     
            if (data) {
                let token = data.headers.authorization.replace('bearer ', '').replace('Bearer ', '');
                const parts = token.split('.');
                const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
                const content = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                // console.log(decoded);
    
                return [header,content]
            }
            
            return ""
  
      
    }

}

