$('#addReview').submit(function (e) {
    $('.alert.alert-danger').hide();
    if (!$('input#name').val() || !$('select#rating').val() ||
        !$('textarea#review').val()) {
        alert('Hiiii');
        if ($('.alert.alert-danger').length) {
            $('.alert.alert-danger').show();
        } else {
            $(this).prepend('<div role="alert" class="alert alert-danger">All             fields required, please try again - From client < /div>');
            e.preventDefault();
        }
        return false;
    }
});
