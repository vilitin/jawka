function auth () {

    if ( account.id != 0 ) {

        return true;
    }

    return false;
}

window.App || ( window.App = {} );

App.hTimer = 0;
App.time_ms = 7000;

App.hChatTimer = 0;
App.chat_time_ms = 2000;

App.init = function() {

    if (App.hTimer) clearTimeout(App.hTimer);
    App.run();
}

App.run = function() {

    $.ajax({
        type: "GET",
        url: "/account/notifications",
        data: "action=getNotificationsCount",
        success: function(text) {

            var count = parseInt(text);

            $("span#notifications_counter").text(count);

            if (count < 1) $("span#notifications_counter_cont").hide();
            if (count > 0) $("span#notifications_counter_cont").show()
        },
        complete: function() {

            // console.log(update.time_ms)
            // Добавляем 4 секунд для следуещего обновления
            App.time_ms = App.time_ms + 4000;

            App.hTimer = setTimeout(function() {

                App.init();

            }, App.time_ms);
        }
    });

    $.ajax({
        type: "GET",
        url: "/account/messages",
        data: "action=getMessagesCount",
        success: function(text) {

            var count = parseInt(text);

            $("span#messages_counter").text(count);

            if (count < 1) $("span#messages_counter_cont").hide();
            if (count > 0) $("span#messages_counter_cont").show()
        }
    });
}

App.chatInit = function(chat_id, user_id, access_token) {

    if (App.hChatTimer) clearTimeout(App.hChatTimer);
    App.chatRun(chat_id, user_id, access_token);
}

App.chatRun = function(chat_id, user_id, access_token) {

    if (typeof options.pageId !== typeof undefined && options.pageId === "chat") {

        Messages.update(chat_id, user_id, access_token)
    }
}

App.getLanguageBox = function(title) {

    var url = "/language/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, fixed:true});
};

App.getPromptBox = function(action) {

    var url = "/prompt/?action=" + action;
    $.colorbox({width:"450px", href: url, title: lang_prompt_box, fixed:true});
}

App.setLanguage = function(language) {

    $.cookie("lang", language, { expires : 7, path: '/' });
    $.colorbox.close();
    location.reload();
};

window.Users || ( window.Users = {} );

Users.follow = function (username, hash) {

    if (!auth()) {

        App.getPromptBox("follow");

        return;
    }

    $('.js_follow_btn').attr('disabled', 'disabled');

    $.ajax({
        type: 'POST',
        url: '/' + username + '/follow',
        data: 'profile=' + username + '&accessToken=' + hash,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('.js_follow_btn').removeAttr('disabled');

            if(response.error === false) {

                $(".js_follow_block").html(response.html);

                if (options.pageId === "profile") {

                    if (response.hasOwnProperty('followersCount')) {

                        $("#stat_followers_count").html(response.followersCount);
                    }
                }

            } else {

                if (response.error_code == 101) {

                    window.location = "/prompt/?act=follow";
                }
            }
        },
        error: function(xhr, type){


        }
    });
}

window.Report || ( window.Report = {} );

Report.submit = function () {

    var attr = $("#report_submit").attr('disabled');

    if (typeof attr !== typeof undefined && attr !== false) {

        return false;
    }

    return true;
}

Report.selectReason = function () {

    $("#report_submit").removeAttr("disabled");

    return true;
}

window.Post || ( window.Post = {} );

Post.remove = function (postId, hash) {

    $('div.post_item[data-id=' + postId + ']').hide();

    $.ajax({
        type: 'POST',
        url: '/' + account.username + '/post/' + postId +'/remove',
        data: 'accessToken=' + hash,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.post_item[data-id=' + postId + ']').remove();

            if (options.pageId === "profile") {

                if (response.hasOwnProperty('postsCount')) {

                    posts_all = response.postsCount;
                }

                posts_loaded = posts_loaded - 1;

                if (posts_all > 0) {

                    $('#stat_posts_count').html(posts_all);

                } else {

                    $('#stat_posts_count').html(0);
                }

                if (response.hasOwnProperty('html')) {

                    $("div.answers_cont").html(response.html);
                }
            }

            if (options.pageId === "post" && response.hasOwnProperty('result')) {

                $("div.posts_cont").html(response.result);
            }
        },
        error: function(xhr, type){

            $('div.post_item[data-id=' + postId + ']').show();
        }
    });
}

Post.like = function (profile, postId, hash) {

    if (!auth()) {

        App.getPromptBox("like");

        return;
    }

    $.ajax({
        type: 'POST',
        url: '/' + profile + '/post/' + postId +'/like',
        data: 'accessToken=' + hash,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            if (response.myLike) {

                $('.like_icon[data-id=' + postId + ']').addClass("mylike");

            } else {

                $('.like_icon[data-id=' + postId + ']').removeClass("mylike");
            }

            if (response.hasOwnProperty('html')){

                $('.post_like_count[data-id=' + postId + ']').html(response.html);
            }

            if (options.pageId === "profile") {

                if (response.hasOwnProperty('likesCount')) {

                    $("#stat_likes_count").html(response.likesCount);
                }
            }
        },
        error: function(xhr, type){

            $('div.post_item[data-id=' + postId + ']').show();
        }
    });
}

Post.getRepostBox = function(username, postId, title, myRePost) {

    if (!auth()) {

        App.getPromptBox("repost");

        return;
    }

    if (myRePost == 1) {

        return;
    }

    var url = "/" + username + "/repost/?action=get-box&postId=" + postId;
    $.colorbox({width:"450px", href: url, title: title, fixed:true});
};

Post.rePost = function (username) {

    var postText = $('textarea[name=postText]').val();
    var postImg =  $('input[name=postImg]').val();
    var rePostId =  $('input[name=rePostId]').val();

    postText = $.trim(postText);
    postImg = $.trim(postImg);

    if (postText.length == 0 && postImg == 0 && rePostId == 0) {

        return;
    }

    $.ajax({
        type: 'POST',
        url: '/' + username + "/post",
        data: $("form.repost_form").serialize(),
        dataType: 'json',
        timeout: 30000,
        success: function(response) {

            $("a.action_share[data-id=" + rePostId + "]").prop('onclick',null).off('click');
            //$("a.action_share[data-id=" + rePostId + "]").remove();
            $.colorbox.close();
        },
        error: function(xhr, type){

        }
    });
};

Post.getReportBox = function(username, postId, title) {

    var url = "/" + username + "/post/" + postId + "/report/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, fixed:true});
};

Post.sendReport = function(username, postId, reason, hash) {

    $.ajax({
        type: 'POST',
        url: "/" + username + "/post/" + postId + "/report",
        data: "reason=" + reason + "&authenticity_token=" + hash,
        timeout: 30000,
        success: function (response) {

        },
        error: function (xhr, type) {

        }
    });

    $.colorbox.close();
};

window.Wall || ( window.Wall = {} );

Wall.more = function (username, offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/' + username,
        data: 'postId=' + offset + "&loaded=" + posts_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.answers_cont").append(response.html);
            }

            posts_loaded = response.posts_loaded;
            posts_all = response.posts_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
};

window.Group || ( window.Group = {} );

Group.changePhoto = function(group, title) {

    var url = "/" + group + "/ajax_photo/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, overlayClose: false, fixed:true, onComplete: function(){

        $('.cover_input').upload({
            name: 'userfile',
            method: 'post',
            enctype: 'multipart/form-data',
            action: '/' + group + '/ajax_photo',
            onComplete: function(text) {

                var response = JSON.parse(text);

                if (response.hasOwnProperty('error')) {

                    //alert(response.normalCoverUrl);

                    if (response.error === false) {

                        if (response.hasOwnProperty('bigPhotoUrl')) {

                            $('img.user_image').attr("src", response.bigPhotoUrl);
                            $('a.profile_img_wrap').attr("data-img", response.normalPhotoUrl);

                            PhotoExists = true;

                            $.colorbox.close();
                        }
                    }

                    //$("div.questions_cont").append(response.html);
                }

                $("div.file_loader_block").hide();
                $("div.file_select_block").show();
            },
            onSubmit: function() {

                $("div.file_select_block").hide();
                $("div.file_loader_block").show();
            }
        });
    }});
};

Group.more = function (username, offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/' + username,
        data: 'itemId=' + offset + "&loaded=" + posts_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.answers_cont").append(response.html);
            }

            posts_loaded = response.posts_loaded;
            posts_all = response.posts_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
};

window.Search || ( window.Search = {} );

Search.more = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/search/name',
        data: 'userId=' + offset + "&loaded=" + items_loaded + "&query=" + query,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.search_cont").append(response.html);
            }

            items_loaded = response.items_loaded;
            items_all = response.items_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
};

Search.communitiesMore = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/search/groups',
        data: 'itemId=' + offset + "&loaded=" + items_loaded + "&query=" + query,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.search_cont").append(response.html);
            }

            items_loaded = response.items_loaded;
            items_all = response.items_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Feeds || ( window.Feeds = {} );

Feeds.more = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/wall',
        data: 'itemId=' + offset + "&loaded=" + inbox_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.wall_cont").append(response.html);
            }

            inbox_loaded = response.inbox_loaded;
            inbox_all = response.inbox_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Hashtags || ( window.Hashtags = {} );

Hashtags.more = function (offset, hashtag) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/hashtag/?src=' + hashtag,
        data: 'postId=' + offset + "&loaded=" + inbox_loaded + "&hashtag=" + hashtag,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div#posts_cont").append(response.html);
            }

            inbox_loaded = response.inbox_loaded;
            inbox_all = response.inbox_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
};

window.Stream || ( window.Stream = {} );

Stream.more = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/stream',
        data: 'itemId=' + offset + "&loaded=" + inbox_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.stream_cont").append(response.html);
            }

            inbox_loaded = response.inbox_loaded;
            inbox_all = response.inbox_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Followers || ( window.Followers = {} );

Followers.more = function (profile, offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/' + profile + '/followers',
        data: 'id=' + offset + "&loaded=" + friends_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.friends_cont").append(response.html);
            }

            friends_loaded = response.friends_loaded;
            friends_all = response.friends_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Following || ( window.Following = {} );

Following.more = function (profile, offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/' + profile + '/following',
        data: 'id=' + offset + "&loaded=" + friends_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.friends_cont").append(response.html);
            }

            friends_loaded = response.friends_loaded;
            friends_all = response.friends_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Likers || ( window.Likers = {} );

Likers.more = function (profile, postId, offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/' + profile + '/post/' + postId + '/people',
        data: 'likeId=' + offset + "&loaded=" + items_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.people_cont").append(response.html);
            }

            items_loaded = response.items_loaded;
            items_all = response.items_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Chats || ( window.Chats = {} );

Chats.more = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/messages',
        data: 'messageCreateAt=' + offset + "&loaded=" + chats_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.messages_cont").append(response.html);
            }

            chats_loaded = response.chats_loaded;
            chats_all = response.chats_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.BlackList || ( window.BlackList = {} );

BlackList.remove = function(id, username, hash) {

    $.ajax({
        type: 'POST',
        url: "/" + username + "/block",
        data: "authenticity_token=" + hash,
        dataType: 'json',
        timeout: 30000,
        success: function (response) {

            $('div.post[data-id=' + id + ']').remove();
        },
        error: function (xhr, type) {

        }
    });
}

BlackList.more = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/settings/blacklist',
        data: 'itemId=' + offset + "&loaded=" + items_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.blacklist_cont").append(response.html);
            }

            items_loaded = response.items_loaded;
            items_all = response.items_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Favorites || ( window.Favorites = {} );

Favorites.more = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/favorites',
        data: 'itemId=' + offset + "&loaded=" + items_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.favorites_cont").append(response.html);
            }

            items_loaded = response.items_loaded;
            items_all = response.items_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Groups || ( window.Groups = {} );

Groups.myGroupsMore = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/groups',
        data: 'itemId=' + offset + "&loaded=" + items_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.my_groups_cont").append(response.html);
            }

            items_loaded = response.items_loaded;
            items_all = response.items_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
};

Groups.managedGroupsMore = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/managed_groups',
        data: 'itemId=' + offset + "&loaded=" + items_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.managed_groups_cont").append(response.html);
            }

            items_loaded = response.items_loaded;
            items_all = response.items_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
};

window.Notifications || ( window.Notifications = {} );

Notifications.moreAnswers = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/notifications/answers',
        data: 'createAt=' + offset + "&loaded=" + answers_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.notifications_cont").append(response.html);
            }

            answers_loaded = response.answers_loaded;
            answers_all = response.answers_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

Notifications.moreAll = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/notifications',
        data: 'notifyId=' + offset + "&loaded=" + notifications_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.notifications_cont").append(response.html);
            }

            notifications_loaded = response.notifications_loaded;
            notifications_all = response.notifications_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

Notifications.moreLikes = function (offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/notifications/likes',
        data: 'createAt=' + offset + "&loaded=" + likes_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if ( response.hasOwnProperty('html') ){

                $("div.notifications_cont").append(response.html);
            }

            likes_loaded = response.likes_loaded;
            likes_all = response.likes_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

window.Video || ( window.Video = {} );

Video.playYouTube = function(container, video) {

    video = "http://www.youtube.com/v/" + video + "?autoplay=1&start=0";

    $(container).parent().html("<object width=\"98%\" height=\"300\"><param name=\"movie\" value=\"" + video + "\"><param name=\"allowFullScreen\" value=\"true\"><param name=\"wmode\" value=\"transparent\"><param name=\"allowscriptaccess\" value=\"always\"><embed src=\"" + video + "\" type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" width=\"98%\" height=\"300\"></object>");
};

window.Background || ( window.Background = {} );

Background.set = function(img, hash) {

    $.ajax({
        type: "POST",
        url: "/account/settings/profile/background",
        data: "number=" + img + "&access_token=" + hash + "&act=setBackground",
        success : function(text) {

            if (text.length > 0) {

                $('body').css("background-image", "url(" + text + ")");
            }
        }
    });
};

window.Profile || ( window.Profile = {} );

Profile.getBlockBox = function(username, title) {

    if (!auth()) {

        return;
    }

    var attr = $("a.js_block_btn").attr("data-action");

    if (typeof attr !== typeof undefined) {

        if (attr === "block") {

            var url = "/" + username + "/block/?action=get-box";
            $.colorbox({width:"450px", href: url, title: title, fixed:true});

        } else {

            Profile.block(username, auth_token);
        }
    }
};

Profile.block = function(username, hash) {

    $.ajax({
        type: 'POST',
        url: "/" + username + "/block",
        data: "authenticity_token=" + hash,
        dataType: 'json',
        timeout: 30000,
        success: function (response) {

            if (response.hasOwnProperty('text')) {

                $('a.js_block_btn').text(response.text);
            }

            if (response.hasOwnProperty('action')) {

                $('a.js_block_btn').attr("data-action", response.action);
            }
        },
        error: function (xhr, type) {

        }
    });

    $.colorbox.close();
}

Profile.getReportBox = function(username, title) {

    var url = "/" + username + "/report/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, fixed:true});
};

Profile.sendReport = function(username, reason, hash) {

    $.ajax({
        type: 'POST',
        url: "/" + username + "/report",
        data: "reason=" + reason + "&authenticity_token=" + hash,
        timeout: 30000,
        success: function (response) {

        },
        error: function (xhr, type) {

        }
    });

    $.colorbox.close();
}

Profile.showPostForm = function () {

    $("form.profile_question_form").show();
    $('div.remotivation_block').hide();

    $('textarea[name=postText]').focus();
    $('textarea[name=postText]').css("height", "42px");
}

Profile.post = function (username) {

    var postText = $('textarea[name=postText]').val();
    var postImg =  $('input[name=postImg]').val();
    var postMode = $('input[name="mode_checkbox"]:checked').length > 0;

    postText = $.trim(postText);
    postImg = $.trim(postImg);

    if (postText.length == 0 && postImg == 0) {

        $('textarea[name=postText]').focus();

        return;
    }

    $.ajax({
        type: 'POST',
        url: '/' + username + "/post",
        data: $("form.profile_question_form").serialize(),
        dataType: 'json',
        timeout: 30000,
        success: function(response) {

            $('textarea[name=postText]').val('');
            $('input[name=postImg]').val('');
            $("div.img_container").hide();
            $("img.post_img_preview").attr("src", "");
            $('#word_counter').html('300');

            $("a.post_img_delete").hide();
            $("a.add_image_to_post").show();

            if (response.hasOwnProperty('html')) {

                if ($("div.answers_cont").length != 0) {

                    $("div.info").remove();
                }

                $("div.answers_cont").prepend(response.html);
            }

            if (response.hasOwnProperty('postsCount')) {

                posts_all = response.postsCount;
                $('#stat_posts_count').html(posts_all);
            }

            $('form.profile_question_form').hide();
            $('div.remotivation_block').show();
        },
        error: function(xhr, type){

        }
    });
};

Profile.changeCover = function(title) {

    var url = "/account/ajax_cover/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, overlayClose: false, fixed:true, onComplete: function(){

        $('.cover_input').upload({
            name: 'userfile',
            method: 'post',
            enctype: 'multipart/form-data',
            action: '/account/ajax_cover',
            onComplete: function(text) {

                var response = JSON.parse(text);

                if (response.hasOwnProperty('error')) {

                    //alert(response.normalCoverUrl);

                    if (response.error === false) {

                        if (response.hasOwnProperty('normalCoverUrl')) {

                            $('div.profile_cover').css("background-image", "url(" + response.normalCoverUrl + ")");
                            $('div.profile_cover').css("background-position", "0px 0px");

                            CoverExists = true;

                            Cover.edit();

                            $.colorbox.close();
                        }
                    }

                    $("div.questions_cont").append(response.html);
                }

                $("div.file_loader_block").hide();
                $("div.file_select_block").show();
            },
            onSubmit: function() {

                $("div.file_select_block").hide();
                $("div.file_loader_block").show();
            }
        });
    }});
};

Profile.changePhoto = function(title) {

    var url = "/account/ajax_photo/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, overlayClose: false, fixed:true, onComplete: function(){

        $('.cover_input').upload({
            name: 'userfile',
            method: 'post',
            enctype: 'multipart/form-data',
            action: '/account/ajax_photo',
            onComplete: function(text) {

                var response = JSON.parse(text);

                if (response.hasOwnProperty('error')) {

                    //alert(response.normalCoverUrl);

                    if (response.error === false) {

                        if (response.hasOwnProperty('bigPhotoUrl')) {

                            $('img.user_image').attr("src", response.bigPhotoUrl);
                            $('a.profile_img_wrap').attr("data-img", response.normalPhotoUrl);

                            PhotoExists = true;

                            $.colorbox.close();
                        }
                    }

                    $("div.questions_cont").append(response.html);
                }

                $("div.file_loader_block").hide();
                $("div.file_select_block").show();
            },
            onSubmit: function() {

                $("div.file_select_block").hide();
                $("div.file_loader_block").show();
            }
        });
    }});
};

Profile.changePostImg = function(title) {

    var url = "/account/ajax_post/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, overlayClose: false, fixed:true, onComplete: function(){

        $('.file_select_btn').upload({
            name: 'userfile',
            method: 'post',
            enctype: 'multipart/form-data',
            action: '/account/ajax_post',
            onComplete: function(text) {

                var response = JSON.parse(text);

                if (response.hasOwnProperty('error')) {

                    if (response.error === false) {

                        $.colorbox.close();

                        if (response.hasOwnProperty('imgUrl')) {

                            $("img.post_img_preview").attr("src", response.imgUrl);
                            $("input[name=postImg]").val(response.imgUrl);
                            $("div.img_container").show();

                            $("a.post_img_delete").show();
                            $("a.add_image_to_post").hide();
                        }
                    }
                }

                $("div.file_loader_block").hide();
                $("div.file_select_block").show();
            },
            onSubmit: function() {

                $("div.file_select_block").hide();
                $("div.file_loader_block").show();
            }
        });
    }});
};

Profile.deletePostImg = function(event) {

    $("input[name=postImg]").val('');
    $("div.img_container").hide();
    $("img.post_img_preview").attr("src", "");

    $("a.post_img_delete").hide();
    $("a.add_image_to_post").show();
};

window.Cover || ( window.Cover = {} );

Cover.currentBackgroundPosition = "0px 0px";
Cover.oldBackgroundPosition = "0px 0px";

Cover.edit = function() {

    if (CoverExists === false) {

        Profile.changeCover(event);
        return false;

    } else {

        Cover.oldBackgroundPosition = $('div.profile_cover').css('background-position');

        $("div.profile_cover").css("cursor", "move");
        $('div.profile_add_cover').hide();

        $("div.profile_cover_actions").show();
        $("div.profile_cover_start").hide();

        $('div.profile_cover').backgroundDraggable({axis: 'y',
            done: function() {
                Cover.currentBackgroundPosition = $('div.profile_cover').css('background-position');
                console.log(Cover.currentBackgroundPosition);
            }
        });
    }
};

Cover.save = function(access_token) {

    $("div.profile_cover").css("cursor", "default");
    $("div.profile_cover_actions").hide();
    $("div.profile_cover_start").show();
    $('div.profile_add_cover').hide();

    $('div.profile_cover').backgroundDraggable('disable');

    $.ajax({
        type: "POST",
        url: "/account/ajax_cover",
        data: "position=" + Cover.currentBackgroundPosition + "&action=save-position" + "&accessToken=" + access_token,
        success : function(text) {

            return false;
        }
    });
};

Cover.cancel = function() {

    $('div.profile_cover').css('background-position', Cover.oldBackgroundPosition);

    $("div.profile_cover").css("cursor", "default");

    $('div.profile_add_cover').hide();
    $("div.profile_cover_actions").hide();
    $("div.profile_cover_start").show();

    $('div.profile_cover').backgroundDraggable('disable');
};

Cover.delete = function(access_token) {

    $('div.profile_cover').css('background-position', '0');
    $('div.profile_cover').css('background-image', 'url(/img/cover_add.png)');
    $('div.profile_add_cover').show();

    $("div.profile_cover").css("cursor", "default");

    $("div.profile_cover_actions").hide();
    $("div.profile_cover_start").hide();

    $('div.profile_cover').backgroundDraggable('disable');

    $.ajax({
        type: "POST",
        url: "/account/ajax_cover",
        data: "action=delete-cover" + "&accessToken=" + access_token,
        success : function(text) {

            CoverExists = false;
            return false;
        }
    });
};

window.Messages || ( window.Messages = {} );

Messages.update = function (chat_id, user_id, access_token) {

    var message_id = $("div.post_item").last().attr("data-id");

    $.ajax({
        type: 'POST',
        url: '/account/ajax_chat_update',
        data: 'access_token=' + access_token + "&chat_id=" + chat_id + "&user_id=" + user_id + "&message_id=" + message_id,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            if (response.hasOwnProperty('html')) {

                if ($("div.info").length) {

                    $("div.info").remove();
                }

                $(response.html).insertBefore(".comment_form");
            }

            if (response.hasOwnProperty('items_all')) {

                items_all = response.items_all;
                items_loaded = $('div.post_item').length;
            }

            App.chat_time_ms = App.chat_time_ms + 1000;

            App.hChatTimer = setTimeout(function() {

                App.chatInit(chat_id, user_id, access_token);

            }, App.chat_time_ms);
        },
        error: function(xhr, status, error) {

            //var err = eval("(" + xhr.responseText + ")");
            //alert(err.Message);
        }
    });
};

Messages.create = function (chat_id, user_id, access_token) {


    var message_text = $('input[name=message_text]').val();
    var message_img = $('input[name=message_image]').val();
    var message_id = $("div.post_item").last().attr("data-id");

    $.ajax({
        type: 'POST',
        url: '/account/msg',
        data: 'message_text=' + message_text + '&message_img=' + message_img + '&access_token=' + access_token + "&chat_id=" + chat_id + "&user_id=" + user_id + "&message_id=" + message_id,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            if (response.hasOwnProperty('html')) {

                if ($("div.info").length) {

                    $("div.info").remove();
                }

                $(response.html).insertBefore(".comment_form");
                $("input[name=message_text]").val("");
                $("input[name=message_image]").val("");
                $("img.msg_img_preview").attr("src", "/img/camera.png");
            }

            if (response.hasOwnProperty('items_all')) {

                items_all = response.items_all;
                items_loaded = $('div.post_item').length;
            }
        },
        error: function(xhr, type){


        }
    });
};

Messages.more = function (chat_id, user_id) {

    var message_id = $("div.post_item").first().attr("data-id");

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/account/msgMore',
        data: "chat_id=" + chat_id + "&user_id=" + user_id + "&message_id=" + message_id + "&messages_loaded=" + items_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')) {

                $("div.messages_cont").prepend(response.html);
            }

            if (response.hasOwnProperty('html2')) {

                $("div.messages_cont").prepend(response.html2);
            }

            if (response.hasOwnProperty('items_all')) {

                items_all = response.items_all;
                items_loaded = $('div.post_item').length;
            }
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}

Messages.changeChatImg = function(title) {

    var img_url = $("img.msg_img_preview").attr("src");
    var def_url = "/img/camera.png";

    var i = img_url.localeCompare(def_url);

    if (i != 0) {

        $("input[name=message_image]").val("");
        $("img.msg_img_preview").attr("src", def_url);

        return;
    }

    var url = "/account/ajax_msg/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, overlayClose: false, fixed:true, onComplete: function(){

        $('.file_select_btn').upload({
            name: 'userfile',
            method: 'post',
            enctype: 'multipart/form-data',
            action: '/account/ajax_msg',
            onComplete: function(text) {

                var response = JSON.parse(text);

                if (response.hasOwnProperty('error')) {

                    if (response.error === false) {

                        $.colorbox.close();

                        if (response.hasOwnProperty('imgUrl')) {

                            $("input[name=message_image]").val(response.imgUrl);
                            $("img.msg_img_preview").attr("src", response.imgUrl);
                        }
                    }
                }

                $("div.file_loader_block").hide();
                $("div.file_select_block").show();
            },
            onSubmit: function() {

                $("div.file_select_block").hide();
                $("div.file_loader_block").show();
            }
        });
    }});
};

Messages.removeChat = function(chat_id, user_id, access_token) {

    $.ajax({
        type: 'POST',
        url: '/account/chatRemove',
        data: 'access_token=' + access_token + "&chat_id=" + chat_id + "&user_id=" + user_id,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.post[data-id=' + chat_id + ']').remove();
        },
        error: function(xhr, type){


        }
    });
};

window.Comments || ( window.Comments = {} );

Comments.more = function (profile, postId, offset) {

    $.ajax({
        type: 'POST',
        url: '/'+ profile +'/post/' + postId + '/comments',
        data: 'commentId=' + offset + '&act=more',
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            if (response.hasOwnProperty('html')) {

                $("a.get_comments_header[data-id=" + postId + "]").hide();
                $("div.post_comments[data-id=" + postId + "]").prepend(response.html);
            }
        },
        error: function(xhr, type){


        }
    });
};

Comments.remove = function (profile, postId, commentId, accessToken) {

    $.ajax({
        type: 'POST',
        url: '/'+ profile +'/post/' + postId + '/comments',
        data: 'commentId=' + commentId + '&act=remove' + '&accessToken=' + accessToken,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.comment_item[data-id=' + commentId + ']').remove();

            if ($(".post_comments[data-id=" + postId + "]").children('.comment_item').length == 0) {

                $(".get_comments_header[data-id=" + postId + "]").trigger( "click" );
            }

            if (response.hasOwnProperty('html')) {

                $(response.html).insertBefore(".comment_form[data-id=" + postId + "]");
                $("input[data-id=" + postId + "]").val("");
            }
        },
        error: function(xhr, type){


        }
    });
};

Comments.reply = function(replyToUserId, replyToUserUsername, replyToUserFullname) {

    window.replyToUserId = replyToUserId;

    $("input[name=comment_text]").val("@" + replyToUserUsername + ", ");
    $("input[name=comment_text]").focus();
}

Comments.create = function (profile, postId, accessToken) {


    var commentText = $("input[data-id=" + postId + "]").val();

    $.ajax({
        type: 'POST',
        url: '/'+ profile +'/post/' + postId + '/comments',
        data: 'commentText=' + commentText + '&act=create' + '&accessToken=' + accessToken + '&replyToUserId=' + replyToUserId,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            if (response.hasOwnProperty('html')) {

                //$('.post_comments').append(response.html);

                $(response.html).insertBefore(".comment_form[data-id=" + postId + "]");
                $("input[data-id=" + postId + "]").val("");
                replyToUserId = 0;
            }
        },
        error: function(xhr, type){


        }
    });
};

window.Photo || (window.Photo = {});

Photo.getReportBox = function(username, photoId, title) {

    var url = "/" + username + "/photo/" + photoId + "/report/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, fixed:true});
};

Photo.sendReport = function(username, photoId, reason, hash) {

    $.ajax({
        type: 'POST',
        url: "/" + username + "/photo/" + photoId + "/report",
        data: "reason=" + reason + "&authenticity_token=" + hash,
        timeout: 30000,
        success: function (response) {

        },
        error: function (xhr, type) {

        }
    });

    $.colorbox.close();
};

Photo.remove = function (photoId, hash) {

    $('div.gallery_item[data-id=' + photoId + ']').hide();

    $.ajax({
        type: 'POST',
        url: '/' + account.username + '/photo/' + photoId +'/remove',
        data: 'accessToken=' + hash,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.gallery_item[data-id=' + photoId + ']').remove();

            if (options.pageId === "gallery" && response.hasOwnProperty('html')) {

                if (response.hasOwnProperty('photosCount') && response.photosCount == 0) {

                    $("div.gallery_cont").html(response.html);
                }
            }
        },
        error: function(xhr, type){

            $('div.gallery_cont[data-id=' + photoId + ']').show();
        }
    });
};

Photo.add = function (username) {

    var itemImg =  $('input[name=itemImg]').val();

    itemImg = $.trim(itemImg);

    if (itemImg.length == 0) {

        return;
    }

    $.ajax({
        type: 'POST',
        url: '/' + username + "/add_gallery_item",
        data: $("form.profile_question_form").serialize(),
        dataType: 'json',
        timeout: 30000,
        success: function(response) {

            $('input[name=itemImg]').val('');
            $("div.img_container").hide();
            $("img.post_img_preview").attr("src", "");

            $("a.post_img_delete").hide();
            $("a.add_image_to_post").show();

            if (response.hasOwnProperty('html')) {

                if ($("div.gallery_cont").length != 0) {

                    $("div.info").remove();
                }

                $("div.gallery_cont").prepend(response.html);
            }

            //$('form.profile_question_form').hide();
            $('div.remotivation_block').show();
        },
        error: function(xhr, type){

        }
    });
};

Photo.changeGalleryImg = function(title) {

    var url = "/account/ajax_gallery_item/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, overlayClose: false, fixed:true, onComplete: function(){

        $('.file_select_btn').upload({
            name: 'userfile',
            method: 'post',
            enctype: 'multipart/form-data',
            action: '/account/ajax_gallery_item',
            onComplete: function(text) {

                var response = JSON.parse(text);

                if (response.hasOwnProperty('error')) {

                    if (response.error === false) {

                        $.colorbox.close();

                        if (response.hasOwnProperty('normalPhotoUrl')) {

                            $("img.post_img_preview").attr("src", response.previewPhotoUrl);
                            $("input[name=itemImg]").val(response.normalPhotoUrl);
                            $("input[name=itemPreviewImg]").val(response.previewPhotoUrl);
                            $("input[name=itemOriginImg]").val(response.originPhotoUrl);
                            $("div.img_container").show();

                            $("a.post_img_delete").show();
                            $("a.add_image_to_post").hide();
                        }
                    }
                }

                $("div.file_loader_block").hide();
                $("div.file_select_block").show();
            },
            onSubmit: function() {

                $("div.file_select_block").hide();
                $("div.file_loader_block").show();
            }
        });
    }});
};

Photo.deleteGalleryImg = function(event) {

    $("input[name=itemImg]").val('');
    $("input[name=itemPreviewImg]").val('');
    $("input[name=itemOriginImg]").val('');
    $("div.img_container").hide();
    $("img.post_img_preview").attr("src", "");

    $("a.post_img_delete").hide();
    $("a.add_image_to_post").show();
};

Photo.more = function (username, offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/' + username + '/gallery',
        data: 'itemId=' + offset + "&loaded=" + photos_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.gallery_cont").append(response.html);
            }

            photos_loaded = response.photos_loaded;
            photos_all = response.photos_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
};

$(document).ready(function() {

    $.support.cors = true;

    if (auth()) {

        App.init();
    }

    $(document).on("click", "img.user_image", function() {

        var url = $(this).parent().attr("data-img");

        if (url.length != 0) {

            $.colorbox({maxWidth:"80%", maxHeight:"80%", href:url, title: "", photo: true});
        }

        return false;
    });

    $(document).on("click", "div.post_img > img", function() {

        var url = $(this).attr("src");
        // alert(ask_id);
        // var url = $("img[data-id="+ask_id+"].answer-photo").attr("data-full");
        $.colorbox({maxWidth:"80%", maxHeight:"80%", href:url, title: "", photo: true});
        return false;
    });

    $(document).on("click", "div.gallery_img > img", function() {

        var url = $(this).attr("data-img");
        // alert(ask_id);
        // var url = $("img[data-id="+ask_id+"].answer-photo").attr("data-full");
        $.colorbox({maxWidth:"80%", maxHeight:"80%", href:url, title: "", photo: true});
        return false;
    });
});

window.imagesComments || ( window.imagesComments = {} );

imagesComments.remove = function (profile, postId, commentId, accessToken) {

    $.ajax({
        type: 'POST',
        url: '/'+ profile +'/image/' + postId + '/comments',
        data: 'commentId=' + commentId + '&act=remove' + '&accessToken=' + accessToken,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.comment_item[data-id=' + commentId + ']').remove();

            if ($(".post_comments[data-id=" + postId + "]").children('.comment_item').length == 0) {

                $(".get_comments_header[data-id=" + postId + "]").trigger( "click" );
            }

            if (response.hasOwnProperty('html')) {

                $(response.html).insertBefore(".comment_form[data-id=" + postId + "]");
                $("input[data-id=" + postId + "]").val("");
            }
        },
        error: function(xhr, type){


        }
    });
};

imagesComments.reply = function(replyToUserId, replyToUserUsername, replyToUserFullname) {

    window.replyToUserId = replyToUserId;

    $("input[name=comment_text]").val("@" + replyToUserUsername + ", ");
    $("input[name=comment_text]").focus();
}

imagesComments.create = function (profile, postId, accessToken) {


    var commentText = $("input[data-id=" + postId + "]").val();

    $.ajax({
        type: 'POST',
        url: '/'+ profile +'/image/' + postId + '/comments',
        data: 'commentText=' + commentText + '&act=create' + '&accessToken=' + accessToken + '&replyToUserId=' + replyToUserId,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            if (response.hasOwnProperty('html')) {

                //$('.post_comments').append(response.html);

                $(response.html).insertBefore(".comment_form[data-id=" + postId + "]");
                $("input[data-id=" + postId + "]").val("");
                replyToUserId = 0;
            }
        },
        error: function(xhr, type){

        }
    });
};

window.Images || ( window.Images = {} );

Images.remove = function (postId, hash) {

    $('div.post_item[data-id=' + postId + ']').hide();

    $.ajax({
        type: 'POST',
        url: '/' + account.username + '/image/' + postId +'/remove',
        data: 'accessToken=' + hash,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.post_item[data-id=' + postId + ']').remove();

            if (options.pageId === "profile") {

                if (response.hasOwnProperty('postsCount')) {

                    posts_all = response.postsCount;
                }

                posts_loaded = posts_loaded - 1;

                if (posts_all > 0) {

                    $('#stat_posts_count').html(posts_all);

                } else {

                    $('#stat_posts_count').html(0);
                }

                if (response.hasOwnProperty('html')) {

                    $("div.answers_cont").html(response.html);
                }
            }

            if (options.pageId === "post" && response.hasOwnProperty('result')) {

                $("div.posts_cont").html(response.result);
            }
        },
        error: function(xhr, type){

            $('div.post_item[data-id=' + postId + ']').show();
        }
    });
}

Images.like = function (profile, postId, hash) {

    if (!auth()) {

        App.getPromptBox("like");

        return;
    }

    $.ajax({
        type: 'POST',
        url: '/' + profile + '/image/' + postId +'/like',
        data: 'accessToken=' + hash,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            if (response.myLike) {

                $('.like_icon[data-id=' + postId + ']').addClass("mylike");

            } else {

                $('.like_icon[data-id=' + postId + ']').removeClass("mylike");
            }

            if (response.hasOwnProperty('html')){

                $('.post_like_count[data-id=' + postId + ']').html(response.html);
            }

            if (options.pageId === "profile") {

                if (response.hasOwnProperty('likesCount')) {

                    $("#stat_likes_count").html(response.likesCount);
                }
            }
        },
        error: function(xhr, type){

            $('div.post_item[data-id=' + postId + ']').show();
        }
    });
}

Images.getReportBox = function(username, postId, title) {

    var url = "/" + username + "/image/" + postId + "/report/?action=get-box";
    $.colorbox({width:"450px", href: url, title: title, fixed:true});
};

Images.sendReport = function(username, postId, reason, hash) {

    $.ajax({
        type: 'POST',
        url: "/" + username + "/image/" + postId + "/report",
        data: "reason=" + reason + "&authenticity_token=" + hash,
        timeout: 30000,
        success: function (response) {

        },
        error: function (xhr, type) {

        }
    });

    $.colorbox.close();
};

Images.getLikers = function (profile, postId, offset) {

    $('a.more_link').hide();
    $('a.loading_link').show();

    $.ajax({
        type: 'POST',
        url: '/' + profile + '/image/' + postId + '/people',
        data: 'likeId=' + offset + "&loaded=" + items_loaded,
        dataType: 'json',
        timeout: 30000,
        success: function(response){

            $('div.more_cont').remove();

            if (response.hasOwnProperty('html')){

                $("div.people_cont").append(response.html);
            }

            items_loaded = response.items_loaded;
            items_all = response.items_all;
        },
        error: function(xhr, type){

            $('a.more_link').show();
            $('a.loading_link').hide();
        }
    });
}