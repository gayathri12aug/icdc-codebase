package gov.nih.nci.icdc.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import gov.nih.nci.icdc.model.ConfigurationDAO;
import gov.nih.nci.icdc.service.FenceService;
import io.swagger.annotations.Api;

@Api(value = "ICDC REST APIs")
@Component
@RestController
public class FenceController {

	private static final Logger logger = LogManager.getLogger(FenceController.class);

	@Autowired
	private FenceService service;


	@Autowired
	private ConfigurationDAO config;
	
	@CrossOrigin
	@RequestMapping(value = "/fence/logout", method = RequestMethod.GET)
	public void logout(HttpServletRequest request, HttpServletResponse response) throws Exception {
	
		// get current session, and don't create one if it doesn't exist
	    HttpSession theSession = request.getSession( false );
	    if( theSession != null ) {
	      synchronized( theSession ) {
	        // invalidating a session destroys it
	        theSession.invalidate();
	      }
	    }
	    response.setHeader("Location", config.getFenceURL()+"next="+config.getFencdRedirect());
	    response.setStatus(302);
		
	}
	
	@CrossOrigin
	@RequestMapping(value = "/fence/login/{code}", method = RequestMethod.GET)
	public Map<String,String> login(@PathVariable("code") String code, 
	        HttpServletRequest request, 
	        HttpServletResponse response) throws Exception {
		
		// exchange code for token from fence. 
		
		//		{
		//			"access_token": "",
		//			"expires_in": 1200,
		//			"id_token": "",
		//			"refresh_token": "",
		//			"token_type": "Bearer"
		//		}
		String getTokens = service.getToken(code);
		
		
		JsonParser parser = new JsonParser();
		
		JsonElement jsonTree = parser.parse(getTokens);
		
		Boolean hasErr = false;
		if(jsonTree.isJsonObject()) {
		    JsonObject jsonObject = jsonTree.getAsJsonObject();
		    JsonElement accessToken = jsonObject.get("access_token");
		    JsonElement expires = jsonObject.get("expires_in");
		    JsonElement idToken = jsonObject.get("id_token");
		    JsonElement tokenType = jsonObject.get("token_type");
		    
		    if(null!=accessToken && accessToken.toString()!="") {
		    	// decode accessToken
		    	DecodedJWT jwt = JWT.decode(accessToken.toString());
		    	
		    	// Create a session object if it is already not  created.
		        HttpSession session = request.getSession(true);
		        
		        // store token in session 
		        session.setAttribute("token", jwt);
		        
		    	
		    	String payload =  jwt.getPayload();
		    	//		    	{
				//		    		  "pur": "access",
				//		    		  "aud": [
				//		    		    "openid",
				//		    		    "user",
				//		    		    "82pslYFJqA7auRvKYfTOK67jzQAMb8f6C33tlmZz"
				//		    		  ],
				//		    		  "sub": "5567",
				//		    		  "iss": "https://nci-crdc-staging.datacommons.io/user",
				//		    		  "iat": 1566578028,
				//		    		  "exp": 1566579228,
				//		    		  "jti": "69443545-ade5-443c-b25b-b39ba06013f7",
				//		    		  "context": {
				//		    		    "user": {
				//		    		      "name": "cheny39",
				//		    		      "is_admin": false,
				//		    		      "projects": {},
				//		    		      "google": {
				//		    		        "proxy_group": null
				//		    		      }
				//		    		    }
				//		    		  },
				//		    		  "azp": "82pslYFJqA7auRvKYfTOK67jzQAMb8f6C33tlmZz"
				//		    		}
		    	
		    	
		    	// payload is Base64Url encoded
		    	String token = new String(Base64.getDecoder().decode(payload));
		    	JsonElement jsonPayload= parser.parse(token);
		    	if(jsonPayload.isJsonObject()) {
		    		 JsonObject objectPayload = jsonPayload.getAsJsonObject();
		    		 JsonElement payLoadContext = objectPayload.get("context");
		    		 if(payLoadContext.isJsonObject()) {
		    			 JsonObject objectPayLoadContext = payLoadContext.getAsJsonObject();
		    			 JsonObject ObjectUser = objectPayLoadContext.get("user").getAsJsonObject();
			    		 String userName = ObjectUser.get("name").toString();
			    		 HashMap<String, String> map = new HashMap<>(); 
			    		 map.put("user", userName); 
			    		 
			    		 return map ;
		    		 }else {
		    			 hasErr = true;
		    		 }
		    	}else {
		    		hasErr = true;
		    	}
		    	
		    }else {
		    	hasErr = true;
		    }
		    
		}else {
			hasErr= true;
		}
		
		if(hasErr) {
			logger.error("Not able to retrieve the token , err message : " + getTokens);
			throw new Exception("Not able to retrieve the token , err message : " + getTokens);
		}
		
		return null;

	}

}