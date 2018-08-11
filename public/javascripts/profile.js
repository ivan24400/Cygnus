$(document).ready(function () {
    $.ajax({
        type: 'GET',
        url: '/user/api/v1/user/profile',
        success: function (res) {
            $('#ep_firstname').val(res[0].u_firstname);
            $('#ep_lastname').val(res[0].u_lastname);
            $('#ep_username').val(res[0].username);
            $('#ep_password').val('');
            if(res[0].u_gender === 'm'){
                $('#ep_gender_m').prop("checked",true);
            } else if(res[0].u_gender === 'f'){
                $('#ep_gender_f').prop("checked",true);
            }else if(res[0].u_gender === 'o'){
                $('#ep_gender_o').prop("checked",true);
            }
            $('#ep_gender').find(':radio[name=ep_gender][value='+res[0].u_gender+']').prop('checked', true);
            $('#ep_dob').val(res[0].u_dob.split('T')[0]);
        }
    })
});