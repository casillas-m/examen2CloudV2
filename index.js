const http = require("https"); 
exports.handler = async (event) => {
    return new Promise((resolve, reject) => {
      
        const options = {
          "method": "POST",
          "hostname": "api.us-south.natural-language-understanding.watson.cloud.ibm.com",
          "path": "/instances/df6ec8f5-45a1-4e94-8968-695261ff0eb8/v1/analyze?version=2020-08-01",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": process.env.auth
          }
        };
        
        const req = http.request(options,  (res)=>{
          const chunks = [];
          
          res.on("data", function (chunk) {
            chunks.push(chunk);
          });
        
          res.on("end", function () {
            const body = JSON.parse(Buffer.concat(chunks).toString())
            resolve(body);
          });
        });
        
        req.write(JSON.stringify({
          text: event.historial_clinico,
          features: {
            entities: {
            sentiment: true,
            emotion: true,
            limit: 5
            },
            keywords: {
              emotion: true,
              sentiment: true,
              limit: 5
            }
          }
        }));
        req.end();
    }).then(data=>{
        let keywords = []
        data.keywords.forEach(o=>{
          keywords.push(o.text)
        })
        let entities = []
        data.entities.forEach(o=>{
          entities.push(o.text)
        })
        let palabras_clave_desc ={}
        keywords.forEach((e,index)=>{
          palabras_clave_desc[e]={
            sentimiento:data.keywords[index].sentiment.label,
            relevancia:data.keywords[index].relevance,
            repeticiones:data.keywords[index].count,
            emocion:Object.keys(data.keywords[index].emotion).find(key => data.keywords[index].emotion[key] === Math.max(...Object.values(data.keywords[index].emotion)))
          }
        })
        let entidades_desc ={}
        entities.forEach((e,index)=>{
          entidades_desc[e]={
            tipo:data.entities[index].type,
            sentimiento:data.entities[index].sentiment.label,
            relevancia:data.entities[index].relevance,
            emocion:Object.keys(data.entities[index].emotion).find(key => data.entities[index].emotion[key] === Math.max(...Object.values(data.entities[index].emotion))),
            repeticiones:data.entities[index].count,
            porcentaje_confianza:data.entities[index].confidence
          }
        })
        let salida = {
          lenguaje_texto:data.language,
          palabras_clave:keywords,
          entidades:entities,
          palabras_clave_desc:palabras_clave_desc,
          entidades_desc:entidades_desc
        }
        return salida
    })
    
};