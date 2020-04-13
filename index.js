const _ = require('lodash')
const path = require('path')
export default function ({ types: t }) {
  return {
    visitor: {
      CallExpression (path, options) {
        const loggers = options.opts.loggers || [ { pattern: 'console' } ]
        const maxDepth = parseInt(options.opts.maxDepth) ? parseInt(options.opts.maxDepth) : null
        if (isLogger(path, loggers)) {
          if (!path.node.arguments.length) return;
          let relativePath
          let filePath = this.file.opts.filename
          if (filePath.charAt(0) !== '/') {
            relativePath = filePath
          } else {
            let cwd = process.cwd()
            relativePath = filePath.substring(cwd.length + 1)
          }
          const line = path.node.arguments[0].loc.start.line
          let description = [`%c ${parseRelativePath(relativePath, maxDepth)}:${line} %c `]
          description[0] += path.node.arguments.map(expression => {
            return this.file.code.substring(expression.start, expression.end)
          }).join(', ') + ' '
          description.push('color: black; background-color: #ffd700')
          description.push('color: white; background-color: #111111')
          description.push('\n')
          path.node.arguments = description.map(x => t.stringLiteral(x)).concat(path.node.arguments)
        }
      }
    }
  }
}

function isLogger (path, loggers) {
  return _.some(loggers, function (logger) {
    return path.get('callee').matchesPattern(logger.pattern, true)
  })
}

function parseRelativePath (myPath, maxDepth) {
  if (maxDepth == null) {
    return myPath
  }
  const splitPath = myPath.split(path.sep)
  return splitPath.slice(Math.max(splitPath.length - maxDepth, 0)).join(path.sep)
}
