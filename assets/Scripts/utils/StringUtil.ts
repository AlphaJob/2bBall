export class StringUtil {
    static convertUrlParams() {
        const res = {}
        const search = window.location.search.substr(1)  // 去掉前面的'?'
        search.split('&').forEach(paramStr => {
            const arr = paramStr.split('=')
            const key = arr[0]
            const value = arr[1]
            res[key] = value
        })
        return res;
    }

    static toThousands(num = 0) {
        return num.toString().replace(/\d+/, function (n) {
            return n.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
        });
    }

    static parmasStr(data: any, isGet: boolean = true) {
        var results = '';
        for (var item in data) {
            results += '&' + item + '=' + data[item];
        }
        if (results) {
            results = results.slice(1)//去除&
        }
        if (isGet) results = '?' + results;
        return results;
    }

    static playerName(str: string) {
        if (str.length > 13) {
            return str.substr(0, 5) + '...' + str.substr(str.length - 5, str.length);
        } else {
            return str;
        }
    }

    static numStringState(num: number, needAbridge: boolean = true) {
        let resultStr = '';
        if (needAbridge) {
            if (num < 1000) {
                resultStr = '' + num;
            } else if (num < 1000000) {
                resultStr = '' + Math.floor(num / 1000) + (num == 1000 ? 'K' : '.' + Math.floor(num % 1000 / 100) + 'K');
            } else if (num < 1000000000) {
                resultStr = '' + Math.floor(num / 1000000) + (num == 1000000 ? 'M' : '.' + Math.floor(num % 1000000 / 100000) + 'M');
            } else if (num < 1000000000000) {
                //G
                resultStr = '' + Math.floor(num / 1000000000) + (num == 1000000000 ? 'G' : '.' + Math.floor(num % 1000000000 / 100000000) + 'G');
            } else if (num < 1000000000000000) {
                //T
                resultStr = '' + Math.floor(num / 1000000000000) + (num == 1000000000000 ? 'T' : '.' + Math.floor(num % 1000000000000 / 100000000000) + 'T');
            } else {
                resultStr = '' + Math.floor(num / 1000000000000) + 'T';
            }
        } else {
            let numArr = [];
            let numTempStr = '';
            while (num > 0) {
                let numTemp = num % 1000;
                if (num < 1000) {
                    numTempStr = '' + numTemp;
                } else {
                    if (numTemp >= 100) {
                        numTempStr = '' + numTemp;
                    } else if (numTemp >= 10) {
                        numTempStr = '0' + numTemp;
                    } else {
                        numTempStr = '00' + numTemp;
                    }
                }
                numArr.push(numTempStr);
                num = Math.floor(num / 1000);
            }
            resultStr = numArr.reverse().join(',');
        }
        return resultStr;
    }

    static objectToSrt(obj: object, description: string) {
        for (const key in obj) {
            if (typeof (obj[key]) == "object") {
                description += '[obj:' + key + ']{' + this.objectToSrt(obj[key], description) + '},'; //递归遍历
            }
            else {
                description += '[key:' + key + ']=' + obj[key] + ","
            }
        }
        return description;
    }
    /**
     *获得字符串的字节长度，英文数字1，中文2 
        * @param str
        * @return 
        */
    static stringHasCharNum(str: string): number {
        var len: number = 0;
        var a: Array<string> = str.split("");
        for (var i: number = 0; i < a.length; i++) {
            if (a[i].charCodeAt(0) < 299) {
                len++;
            }
            else {
                len += 2;
            }
        }
        return len;
    }
    /**
     * 向字符具体位置插入字符串
     * @param str 被插字符串
     * @param flg 插入的字符串
     * @param loc 插入位置
     */
    static insertFlg(str: string, flg: string, loc: number) {
        var newstr = "";
        var tmp = str.substring(0, loc);
        var tmp2 = str.substring(loc);
        newstr = tmp + flg + tmp2;
        return newstr;
    }
    /**
     * 替换str中带大括号的字符
     * @param str 
     * @param paramList 
     */
    static paramFormat(str: string, ...paramList): string {
        var g: RegExp;
        if (str) {
            for (var i: number = 0; i < paramList.length; i++) {
                g = new RegExp("\\{" + i + "\\}", "g");
                str = str.replace(g, paramList[i]);
            }
            return str;
        }
        return '';
    }

    static paramFormat2(str: string, paramList): string {
        var g: RegExp;
        for (var i: number = 0; i < paramList.length; i++) {
            g = new RegExp("\\{" + i + "\\}", "g");
            str = str.replace(g, paramList[i]);
        }
        return str;
    }

    static paramFormat3(str, type, paramList): string {
        var g: RegExp;
        for (var i: number = 0; i < paramList.length; i++) {
            g = new RegExp(type);
            str = str.replace(g, paramList[i]);
        }

        return str;
    }

    /**
     *检查是否有特殊字符 
        * @param str
        * @return 
        * 
        */
    public static checkStringHasSpecialKey(str: String): boolean {
        var pattern: RegExp = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
        var rs: string = "";
        for (var i: number = 0; i < str.length; i++) {
            rs = rs + str.substr(i, 1).replace(pattern, '');
        }
        return rs != str;
    }

    public static trim(p_string: string): String {
        if (p_string == null) {
            return '';
        }
        return p_string.replace(/^\s+|\s+$/g, '');
    }

    public static stringHasCharLen(str: string) {
        var a: Array<string> = str.split("");
        return a.length;
    }

    static hex_md5(s) {
        return this.binl2hex(this.core_md5(this.str2binl(s), s.length * this.chrsz));
    }
    private static hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
    private static chrsz = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */
    static binl2hex(binarray) {
        var hex_tab = this.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
        }
        return str;
    }

    static str2binl(str) {
        var bin = Array();
        var mask = (1 << this.chrsz) - 1;
        for (var i = 0; i < str.length * this.chrsz; i += this.chrsz)
            bin[i >> 5] |= (str.charCodeAt(i / this.chrsz) & mask) << (i % 32);
        return bin;
    }

    static core_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = this.md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = this.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = this.md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = this.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = this.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = this.md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = this.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = this.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = this.md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = this.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = this.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = this.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = this.md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = this.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = this.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = this.md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = this.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = this.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = this.md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = this.md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = this.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = this.md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = this.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = this.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = this.md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = this.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = this.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = this.md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = this.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = this.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = this.md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = this.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = this.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = this.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = this.md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = this.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = this.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = this.md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = this.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = this.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = this.md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = this.md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = this.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = this.md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = this.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = this.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = this.md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = this.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = this.md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = this.md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = this.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = this.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = this.md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = this.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = this.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = this.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = this.md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = this.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = this.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = this.md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = this.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = this.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = this.md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = this.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = this.safe_add(a, olda);
            b = this.safe_add(b, oldb);
            c = this.safe_add(c, oldc);
            d = this.safe_add(d, oldd);
        }
        return Array(a, b, c, d);
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    static md5_cmn(q, a, b, x, s, t) {
        return this.safe_add(this.bit_rol(this.safe_add(this.safe_add(a, q), this.safe_add(x, t)), s), b);
    }
    static md5_ff(a, b, c, d, x, s, t) {
        return this.md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    static md5_gg(a, b, c, d, x, s, t) {
        return this.md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    static md5_hh(a, b, c, d, x, s, t) {
        return this.md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    static md5_ii(a, b, c, d, x, s, t) {
        return this.md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    static safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    static bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

}
