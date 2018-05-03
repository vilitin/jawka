<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Регистрация</title>
<%@ include file="common/materialize_header.inc.jsp" %>
<%@ include file="common/materialize_topbar.inc.jsp" %>
</head>
<body>



 
<div class="section no-pad-bot" id="index-banner">
    <div class="container">

        <div class="row">
            <form class="col s12 m6" action="signup" method="post" style="margin: 0 auto; float: none; margin-top: 100px;">

                <input autocomplete="off" type="hidden" name="authenticity_token" value="<?php echo helper::getAuthenticityToken(); ?>">

                <div class="card">
                    <div class="card-content black-text">
                        <span class="card-title">Регистрация</span>
                        <p class="red-text" style="margin-top: 10px; margin-bottom: 10px; Ошибка">
                           
                        </p>

                      
                        

                              

                        <div class="row">
                            <div class="input-field col s12">
                                <input id="username" type="text" class="validate valid" name="username" value="">
                                <label for="username" class="active">Логин</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="input-field col s12">
                                <input id="fullname" type="text" class="validate valid" name="fullname" value="">
                                <label for="fullname" class="active">Ваше Имя</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="input-field col s12">
                                <input id="password" type="password" class="validate valid" name="password" value="">
                                <label for="password" class="active">Пароль</label>
                            </div>
                        </div>

                        <div class="row">
                            <div class="input-field col s12">
                                <input id="email" type="text" class="validate valid" name="email" value="">
                                <label for="email" class="active">Ваша электронная почта (Email)</label>
                            </div>
                        </div>

                        <div class="row" style="margin-bottom: 0px">
                            <div class="col s12">
                                <label></label>
                                <a style="font-size: 0.8rem;" href="terms.jsp">Правила</a>
                            </div>
                        </div>
                    </div>
                    <div class="card-action">
                        <button class="waves-effect waves-light btn <?php echo SITE_THEME; ?>">Зарегистрироваться</button>
                    </div>
                </div>
            </form>
        </div>

    </div>
</div>

<script type="text/javascript" src="js/materialize.min.js"></script>
<script src="js/init.js"></script>

</body>
</html>

