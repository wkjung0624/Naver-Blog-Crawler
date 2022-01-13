const axios = require('axios');
const cheerio = require('cheerio');
const {Base64} = require('js-base64');


const parsing = async (page, blogOwner) => {
    
    let parseData = JSON.parse((await page).data.replace(/['<> \\]/g,'')).postList;
    
    return parseData.map(item => 
        [
            decodeURI(item.title)
                .replace(/\+/g, ' ')
                .replace(/%23/g, '#')
                .replace(/%26/g, '&')
                .replace(/%2C/g, ',')
                .replace(/%2F/g, '/')
                .replace(/%3A/g, ':')
                .replace(/%3F/g, '?')
                .replace(/%3D/g, '=')
                .replace(/&#39%3B/g, '\'')
                .replace(/&quot%3B/g, '"')
                .replace(/&%2339%3B/g, '\''),
            `https://blog.naver.com/${blogOwner}/${item.logNo}`,
        ]
    );
}


const getHTML = async (originURL, _params) => {

    try {
        let fixedParams = _params ? 
            Object.entries(_params).map(item=>item.join("=")).join("&") : ''

        let fixedURL = originURL
            + (originURL.substr(-1) == '?' ? '' : '?')
            + fixedParams;
        
        return await axios.get(fixedURL);
    } catch (err) {
        console.log(err)
    }
}


const getNaverBlogInfo = async (targetId) => {

    const originURL = "https://blog.naver.com/PostTitleListAsync.naver?"
    let results = [];

    let params = {
        blogId : targetId,
        currentPage : 1,
        categoryNo : 23,
        countPerPage : 5,
        viewdate : '',
        parentCategoryNo : '',
    }

    while(true){
        try{
            let page = await getHTML(originURL, params);
            let data = await parsing(page, params.blogId);
            
            results.push(...data);
            params.currentPage++;
            
            if(data.length < 5) break

        } catch {
            break;
        }
    }
    
    return results;
}


const targetId = '게시글 목록을 조회할 ID 입력'


getNaverBlogInfo(targetId).then(res => {
    console.log(res)
})