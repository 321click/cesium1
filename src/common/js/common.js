//加密
import CryptoJS from 'crypto-js';
//定义一个key
const PRIMARY_KEY = "ceewahasgoodluck";
//用户id
const uId = sessionStorage.getItem('profileId');
//用户名
const userName = sessionStorage.getItem('userName');

let commObj = {
  /**
   * 加密
   * @param word
   * @returns {*}
   */
  encrypt(word) {
    const key = CryptoJS.enc.Utf8.parse(PRIMARY_KEY);
    const srcs = CryptoJS.enc.Utf8.parse(word);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      mode : CryptoJS.mode.ECB,
      padding : CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  },

  /**
   * 解密
   * @param word
   * @returns {*}
   */
  decrypt(word) {
    const key = CryptoJS.enc.Utf8.parse(PRIMARY_KEY);
    const decrypt = CryptoJS.AES.decrypt(word, key, {
      mode : CryptoJS.mode.ECB,
      padding : CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  },

  //存入用户名和密码
  setSession(userName,pass,profileId) {
    sessionStorage.userName = userName;
    sessionStorage.pass = pass;
    sessionStorage.profileId = profileId;
  },
  //清除用户名和密码
  clearSession() {
    sessionStorage.userName = '';
    sessionStorage.pass = '';
    sessionStorage.profileId = '';
  },
  showInfoDialog(width, heigh, title, content) {
    $.DialogBySHF.Alert({
      Width : width,
      Height : heigh,
      Title : title,
      Content : content,
    });
  },
  defined(value){
    return value !== undefined && value !== null;
  },
  contains(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
  }

};

export default{
  commObj
}

//提示框
function showInfoDialog(width, heigh, title, content) {
  $.DialogBySHF.Alert({
    Width : width,
    Height : heigh,
    Title : title,
    Content : content,
  });
}

