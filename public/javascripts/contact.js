var phone_count = 1;
var email_count = 1;

function add_phone_input() {
    let newRow = $("<tr>");
    let cols = "";

    cols += '<td><input type="tel" id="c_phone_no'+phone_count+'"class="form-control " pattern="[0-9]{1,15}" name="c_phone_no" autocomplete="off" required></td>';
    cols += '<td><select id="c_phone_type'+phone_count+'"name="c_phone_type" form="contact_form" class="form-control">' +
        '<option value="h">Home</option>' +
        '<option value="w">Work</option>' +
        '<option value="o">Other</option>' +
        '</select></td>';
    cols += '<td><span class="del_phone glyphicon glyphicon-minus action-item"></span></td>';
    newRow.append(cols);
    phone_count++;
    $("table.phone-list").append(newRow);
}

function add_email_input() {
    let newRow = $("<tr>");
    let cols = "";

    cols += '<td><input type="text" id="c_email'+email_count+'"class="form-control" pattern=".*@.*\..{1,4}" name="c_email" autocomplete="off"></td >';
    cols += '<td><select id="c_email_type'+email_count+'"name="c_email_type" form="contact_form" class="form-control">' +
        '<option value="h">Home</option>' +
        '<option value="w">Work</option>' +
        '<option value="o">Other</option>' +
        '</select></td>';
    cols += '<td><span class="del_email glyphicon glyphicon-minus action-item"></span></td>';
    newRow.append(cols);
    email_count++;
    $("table.email-list").append(newRow);
}

$(document).ready(function () {
    /**
     * Add phone and email input box dynamically
     */
    $("table.phone-list").on("click", ".add_phone", function () {
        add_phone_input();
    });

    $("table.email-list").on("click", ".add_email", function () {
        add_email_input();
    });

    $("table.phone-list").on("click", ".del_phone", function () {
        $(this).closest("tr").remove();
    });

    $("table.email-list").on("click", ".del_email", function () {
        $(this).closest("tr").remove();
    });
});

/**
 * Load given contact
 * @param cid contact id
 */
function load_contact(cid) {
    $.ajax({
        type: 'GET',
        url: '/user/api/v1/contacts?id=' + cid,
        success: function (res) {
            if (res.c_id != null) {
                $('#c_id').val(res.c_id);
                $('#c_firstname').val(res.c_firstname);
                if (res.c_lastname != null) $('#c_lastname').val(res.c_lastname);
                if (res.c_address != null) $('#c_address').val(res.c_address);
                if (res.c_dob != null) $('#c_dob').val(res.c_dob.split('T')[0]);
                if (res.c_pic != null) {
                    document.getElementById("c_profile_pic_img").src = window.location.protocol + '//' + window.location.host + '/' + res.c_pic;
                }

                if (res.c_group === 'b') {
                    $('#c_group_b').prop("selected", true);
                } else if (res.c_group === 'f') {
                    $('#c_group_f').prop("selected", true);
                } else if (res.c_group === 'w') {
                    $('#c_group_w').prop("selected", true);
                } else if (res.c_group === 'p') {
                    $('#c_group_p').prop("selected", true);
                } else if (res.c_group === 'n') {
                    $('#c_group_n').prop("selected", true);
                } else {
                    $('#c_group_o').prop("selected", true);
                }
                if (res.c_phone_no != null) {
                    for (var i = 0; i < res.c_phone_no.length; i++) {
                        if (i > 0) {
                            add_phone_input(i);
                        }
                        $('#c_phone_no' + i).val(res.c_phone_no[i]);
                        $('#c_phone_type' + i).val(res.c_phone_type[i]);
                    }
                }
                if (res.c_email != null) {
                    for (var j = 0; j < res.c_email.length; j++) {
                        if (j > 0) {
                            add_email_input(j);
                        }
                        $('#c_email' + j).val(res.c_email[j]);
                        $('#c_email_type' + j).val(res.c_email_type[j]);
                    }
                }
                toggle_contact_readonly();
            }
        }
    });
}

$(document).on('click', '#c_delete_contact', function (event) {
    var name = $('#c_firstname').val();
    var cid = $('#c_id').val();
    $('#u_modal_delete_contact #u_modal_dc_msg').text(name);
    $('#u_modal_delete_contact .u_modal_btn_delete_contact').data("cid", cid);
    $('#u_modal_delete_contact').modal('show');
});

$(document).on('click', '.u_modal_btn_delete_contact', function () {
    var cid = $(this).data('cid');
    if (cid.length == 0) return;

    var listJson = {};
    var list = [];
    list.push(cid);
    listJson = {};
    listJson = {contacts:list};
    listJson = JSON.stringify(listJson);

    $.ajax({
        type: 'DELETE',
        url: '/user/api/v1/contacts',
        data: listJson,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: window.history.back()
    });
});

$(document).on('click', '#c_edit_contact', function (event) {
    toggle_contact_readonly();
});

function toggle_contact_readonly() {
    $("#c_firstname").prop("readonly", !$('#c_firstname').is('[readonly]'));
    $("#c_lastname").prop("readonly", !$('#c_lastname').is('[readonly]'));
    $("#c_dob").prop("readonly", !$('#c_dob').is('[readonly]'));
    $("#c_address").prop("readonly", !$('#c_address').is('[readonly]'));
    $("#c_group").prop("disabled", !$('#c_group').is('[disabled]'));
    $("#c_profile_pic").prop("disabled", !$('#c_profile_pic').is('[disabled]'));
    $("#c_email_input *").prop("disabled", !$('#c_email_input *').is('[disabled]'));
    $("#c_phone_input *").prop("disabled", !$('#c_phone_input *').is('[disabled]'));
}

// Contact image 
$('.c-profile-pic-img').on('click', function () {
    window.open($(this).prop("src"), '_blank');
});

$('.img-upload').change(function () {
    if (this.files != null) {
        if (parseInt(this.files[0].size / 1024 / 1024) > 1) {
            $('#u_modal_info #u_modal_info_msg').text('File size should be less than 1 MB !');
            $('#u_modal_info').modal('show');
            return false;
        }
        previewImg(this);
    }
});

function previewImg(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#' + input.id + '_img').prop('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}