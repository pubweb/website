import React, { Component } from 'react'
import { Link } from '@reach/router';

export default class CopyRight extends Component {
    render() {
        const { title, slug, url, author } = this.props;
        const hitsUrl = `https://hitcounter.pythonanywhere.com/count/tag.svg?url=${url}`
        return (
            <blockquote>
                <ul>
                    <li>
                        <strong>版权声明</strong>
                        &nbsp;&nbsp;:&nbsp;&nbsp;自由转载-非商用-非衍生-保持署名 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank">创意共享4.0许可证</a>
                    </li>
                    <li>
                        <strong>文章链接</strong>
                        &nbsp;&nbsp;:&nbsp;&nbsp;<img src={hitsUrl} alt="Hits" className="hits" />&nbsp;&nbsp;
                        <Link to={slug} key={title}>
                            {url}
                        </Link>
                    </li>
                </ul>
            </blockquote>
        )
    }
}
