## 本脚本没有经过严格测试，慎用！

## The script have not been tested completely, be careful to run it! read help by `node index.js -h`

删除一个目录下的重复文件，主要用在群晖上清理重复的照片和视频文件。

`node index.js /path/to/files /path/to/trash --keep Moments/Mobile/木酱iPhone -v`

注意：

* 本脚本不删除文件，只是将重复文件从第一个参数指定的目录移动到第二个参数指定的目录。
* 不加参数 `--doit`，只会执行检查，不会执行移动。
* 如果有主目录需要被优先保留，可以用`--keep`参数去指定规则（只支持简单的字符串匹配，不支持正则等形式）。但如果有多个符合规则的文件重复，只会随机保留一个，也即：不保证不删除符合--keep规则的文件。
* 垃圾箱目录中的文件解决与源目录一致，方便找回文件。
* 在移动过程中，不要强行退出程序，否则有可能丢失文件。


判断条件：
* MD5一致 & 文件大小一致

TODO：
* 代码整理
* 支持多目录
* 支持还原
