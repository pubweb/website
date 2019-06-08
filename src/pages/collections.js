import React, { Component } from 'react'
import Helmet from 'react-helmet'
import Layout from '../layout'
import config from '../../data/SiteConfig'
import collections from '../../data/collections'

export default class PublicationsPage extends Component {
  render() {
    const pubs = Object.entries(collections)
    return (
      <Layout>
        <Helmet title={`好站收藏 – ${config.siteTitle}`} />
        <div className="container">
          {pubs.map((publication, i) => {
            const company = publication[0]
            const articles = publication[1]

            return (
              <article>
                <h2 className="publication-company">
                  {company}
                </h2>
                <ul key={i}>
                  {articles.map((article, i) => {
                    return (
                      <li key={i}>
                        <a href={article.path} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </article>
            )
          })}
        </div>
      </Layout>
    )
  }
}
