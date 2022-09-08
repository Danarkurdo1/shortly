function validateForm(){
    const urlExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    const regex = new RegExp(urlExpression);
    const urlInput = document.forms['urlForm']['urlInput'].value;
    if(urlInput == ""){
        $(".input-check").css('display', 'block');
        $(".input-check").text("Please enter a link");
    }else if(!urlInput.match(regex)){
        $(".input-check").css('display', 'block');
        $(".input-check").text("this is not a link");
    }else{
        $(".input-check").css('display', 'none');
    }
}

function isEmail(emailAdress){
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (emailAdress.match(regex)){
    return true;
  }else{
    return false;
  }   
}

function validateSignupForm(){
    const email = $("#email");
    const password = $("#password");
    const validEmail = $(".icon-valid-email");
    const invalidEmail = $(".icon-invalid-email");
    const validPass = $(".icon-valid-pass");
    const invalidPass = $(".icon-invalid-pass");
    const emailMsg = $("#emailMsg");
    const passwordMsg = $("#passMsg")

    if(email.val() == ""){
        emailMsg.text("please enter your email.");
        email.addClass("error");
        invalidEmail.css("display", "inline");
    }else{
        invalidEmail.css("display", "none");
        email.removeClass("error");
        emailMsg.text("");
        if(isEmail(email.val())){
            validEmail.css("display", "inline");
            email.addClass("success");
        }else{
            validEmail.css("display", "none");
            email.addClass("error");
            invalidEmail.css("display", "inline");
        }
    }

    if(password.val() == ""){
        passwordMsg.text("password required!");
        password.addClass("error");
        invalidPass.css("display", "inline");
    }else{
        passwordMsg.text("");
        password.removeClass("error");
        invalidPass.css("display", "none");
        if(password.val().length < 8){
            passwordMsg.text("your password too short!");
            password.addClass("error");
            invalidPass.css("display", "inline");
            validPass.css("display", "none");
        }else{
            password.addClass("success");
            validPass.css("display", "inline");
        }
    }
}


function copyToClipbourd(index){
    const shortenUrlValue = $("#url"+index).text();
    navigator.clipboard.writeText(shortenUrlValue);
    $("#btn-copy-"+index).addClass("btn-copied");
    $("#btn-copy-"+index).text("copied");
}

