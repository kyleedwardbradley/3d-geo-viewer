<?php
    
    $CLIENT_ID = "YOUR_CLIENT_ID"
    $CLIENT_SECRET = "YOUR_CLIENT_SECRET"

    $REDIRECT_URI = 'https://your-website.com/oauth2_redirect'
    $AUTHORIZE_URL = "https://sketchfab.com/oauth2/authorize/"
    $ACCESS_TOKEN_URL = "https://sketchfab.com/oauth2/token/"

    // 1. Ask for an authorization code at

    // https://sketchfab.com/oauth2/authorize/?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI

    // 2. The user logs in, accepts your client authentication request

    // 3. Sketchfab redirects to your provided `redirect_uri` with the authorization code in the URL

    // 4. Grab that code and exchange it for an `access_token`

    $fields = array(
        'grant_type' => 'authorization_code',
        'client_id' => urlencode($CLIENT_ID),
        'client_secret' => urlencode($CLIENT_SECRET),
        'redirect_uri' => $REDIRECT_URI,
        'code' => $_GET['code']
    );

    $fields_string = "";
    foreach($fields as $key => $value) {
        $fields_string .= $key.'='.$value.'&';
    }
    $fields_string = rtrim($fields_string, '&');

    $ch = curl_init();
    curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_URL => 'https://sketchfab.com/oauth2/token/',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HEADER => 0,
            CURLOPT_POST => 1,
            CURLOPT_HTTPHEADER => array('Content-Type: application/x-www-form-urlencoded'),
            CURLOPT_POSTFIELDS => $fields_string,
    ));

    $result = curl_exec($ch);

    // The response body of this request contains the `access_token` necessary to authenticate your requests
    // Ex : {"access_token": "1234", "token_type": "Bearer", "expires_in": 36000, "refresh_token": "5678", "scope": "read write"}
    // - expires_in => seconds to live for this `access_token`
    // - refresh_token => A token used to fetch a new `access_token` (See below)

    // Now you're all set, the following request shows how to use your `access_token` in your requests
    // If your access token is recognized, this will return information regarding the current user

    $ch = curl_init();
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_URL => 'https://sketchfab.com/v2/users/me',
        CURLOPT_HEADER => 0,
        CURLOPT_HTTPHEADER => array('Authorization: Bearer YOUR_ACCESS_TOKEN')
    ));
    $result = curl_exec($ch);
    echo $result;

    
    // // Extra:
    // // Before your access token expires, you can refresh it with the `refresh_token`. If it has expired,
    // // you will have to re-do the auhorization workflow

    // $fields = array(
    //    'grant_type' => 'refresh_token',
    //    'client_id' => urlencode($CLIENT_ID),
    //    'client_secret' => urlencode($CLIENT_SECRET),
    //    'refresh_token' => 'YOUR_REFRESH_TOKEN'
    //    );

    // $fields_string = "";
    // foreach($fields as $key => $value) {
    //     $fields_string .= $key.'='.$value.'&';
    // }
    // $fields_string = rtrim($fields_string, '&');

    // $ch = curl_init();
    // curl_setopt_array($ch, array(
    //         CURLOPT_RETURNTRANSFER => 1,
    //         CURLOPT_URL => 'https://sketchfab.com/oauth2/token/',
    //         CURLOPT_SSL_VERIFYPEER => true,
    //         CURLOPT_HEADER => 0,
    //         CURLOPT_POST => 1,
    //         CURLOPT_HTTPHEADER => array('Content-Type: application/x-www-form-urlencoded'),
    //         CURLOPT_POSTFIELDS => $fields_string,
    // ));

    // $result = curl_exec($ch);

    // The response body of this request is exactly the same as the one to get an access_token
    // Ex : {"access_token": "1234", "token_type": "Bearer", "expires_in": 36000, "refresh_token": "5678", "scope": "read write"}
?>