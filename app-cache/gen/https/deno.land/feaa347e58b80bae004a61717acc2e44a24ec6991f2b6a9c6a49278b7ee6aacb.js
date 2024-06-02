// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import Dirent from "./_fs_dirent.ts";
import { assert } from "../../_util/assert.ts";
export default class Dir {
    dirPath;
    syncIterator;
    asyncIterator;
    constructor(path){
        this.dirPath = path;
    }
    get path() {
        if (this.dirPath instanceof Uint8Array) {
            return new TextDecoder().decode(this.dirPath);
        }
        return this.dirPath;
    }
    // deno-lint-ignore no-explicit-any
    read(callback) {
        return new Promise((resolve, reject)=>{
            if (!this.asyncIterator) {
                this.asyncIterator = Deno.readDir(this.path)[Symbol.asyncIterator]();
            }
            assert(this.asyncIterator);
            this.asyncIterator.next().then(({ value  })=>{
                resolve(value ? value : null);
                if (callback) {
                    callback(null, value ? value : null);
                }
            }, (err)=>{
                if (callback) {
                    callback(err);
                }
                reject(err);
            });
        });
    }
    readSync() {
        if (!this.syncIterator) {
            this.syncIterator = Deno.readDirSync(this.path)[Symbol.iterator]();
        }
        const file = this.syncIterator.next().value;
        return file ? new Dirent(file) : null;
    }
    /**
   * Unlike Node, Deno does not require managing resource ids for reading
   * directories, and therefore does not need to close directories when
   * finished reading.
   */ // deno-lint-ignore no-explicit-any
    close(callback) {
        return new Promise((resolve)=>{
            if (callback) {
                callback(null);
            }
            resolve();
        });
    }
    /**
   * Unlike Node, Deno does not require managing resource ids for reading
   * directories, and therefore does not need to close directories when
   * finished reading
   */ closeSync() {
    //No op
    }
    async *[Symbol.asyncIterator]() {
        try {
            while(true){
                const dirent = await this.read();
                if (dirent === null) {
                    break;
                }
                yield dirent;
            }
        } finally{
            await this.close();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2ZzL19mc19kaXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCBEaXJlbnQgZnJvbSBcIi4vX2ZzX2RpcmVudC50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4uLy4uL191dGlsL2Fzc2VydC50c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXIge1xuICBwcml2YXRlIGRpclBhdGg6IHN0cmluZyB8IFVpbnQ4QXJyYXk7XG4gIHByaXZhdGUgc3luY0l0ZXJhdG9yITogSXRlcmF0b3I8RGVuby5EaXJFbnRyeT4gfCBudWxsO1xuICBwcml2YXRlIGFzeW5jSXRlcmF0b3IhOiBBc3luY0l0ZXJhdG9yPERlbm8uRGlyRW50cnk+IHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihwYXRoOiBzdHJpbmcgfCBVaW50OEFycmF5KSB7XG4gICAgdGhpcy5kaXJQYXRoID0gcGF0aDtcbiAgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuZGlyUGF0aCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUodGhpcy5kaXJQYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGlyUGF0aDtcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIHJlYWQoY2FsbGJhY2s/OiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiBQcm9taXNlPERpcmVudCB8IG51bGw+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmFzeW5jSXRlcmF0b3IpIHtcbiAgICAgICAgdGhpcy5hc3luY0l0ZXJhdG9yID0gRGVuby5yZWFkRGlyKHRoaXMucGF0aClbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gICAgICB9XG4gICAgICBhc3NlcnQodGhpcy5hc3luY0l0ZXJhdG9yKTtcbiAgICAgIHRoaXMuYXN5bmNJdGVyYXRvclxuICAgICAgICAubmV4dCgpXG4gICAgICAgIC50aGVuKCh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlID8gdmFsdWUgOiBudWxsKTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlID8gdmFsdWUgOiBudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlYWRTeW5jKCk6IERpcmVudCB8IG51bGwge1xuICAgIGlmICghdGhpcy5zeW5jSXRlcmF0b3IpIHtcbiAgICAgIHRoaXMuc3luY0l0ZXJhdG9yID0gRGVuby5yZWFkRGlyU3luYyh0aGlzLnBhdGgpIVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZTogRGVuby5EaXJFbnRyeSA9IHRoaXMuc3luY0l0ZXJhdG9yLm5leHQoKS52YWx1ZTtcblxuICAgIHJldHVybiBmaWxlID8gbmV3IERpcmVudChmaWxlKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVW5saWtlIE5vZGUsIERlbm8gZG9lcyBub3QgcmVxdWlyZSBtYW5hZ2luZyByZXNvdXJjZSBpZHMgZm9yIHJlYWRpbmdcbiAgICogZGlyZWN0b3JpZXMsIGFuZCB0aGVyZWZvcmUgZG9lcyBub3QgbmVlZCB0byBjbG9zZSBkaXJlY3RvcmllcyB3aGVuXG4gICAqIGZpbmlzaGVkIHJlYWRpbmcuXG4gICAqL1xuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBjbG9zZShjYWxsYmFjaz86ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVubGlrZSBOb2RlLCBEZW5vIGRvZXMgbm90IHJlcXVpcmUgbWFuYWdpbmcgcmVzb3VyY2UgaWRzIGZvciByZWFkaW5nXG4gICAqIGRpcmVjdG9yaWVzLCBhbmQgdGhlcmVmb3JlIGRvZXMgbm90IG5lZWQgdG8gY2xvc2UgZGlyZWN0b3JpZXMgd2hlblxuICAgKiBmaW5pc2hlZCByZWFkaW5nXG4gICAqL1xuICBjbG9zZVN5bmMoKTogdm9pZCB7XG4gICAgLy9ObyBvcFxuICB9XG5cbiAgYXN5bmMgKltTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPERpcmVudD4ge1xuICAgIHRyeSB7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCBkaXJlbnQ6IERpcmVudCB8IG51bGwgPSBhd2FpdCB0aGlzLnJlYWQoKTtcbiAgICAgICAgaWYgKGRpcmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkIGRpcmVudDtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxPQUFPLFlBQVksa0JBQWtCO0FBQ3JDLFNBQVMsTUFBTSxRQUFRLHdCQUF3QjtBQUUvQyxlQUFlLE1BQU07SUFDWCxRQUE2QjtJQUM3QixhQUE4QztJQUM5QyxjQUFvRDtJQUU1RCxZQUFZLElBQXlCLENBQUU7UUFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRztJQUNqQjtJQUVBLElBQUksT0FBZTtRQUNqQixJQUFJLElBQUksQ0FBQyxPQUFPLFlBQVksWUFBWTtZQUN0QyxPQUFPLElBQUksY0FBYyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU87UUFDOUMsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU87SUFDckI7SUFFQSxtQ0FBbUM7SUFDbkMsS0FBSyxRQUFtQyxFQUEwQjtRQUNoRSxPQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsU0FBVztZQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxhQUFhLENBQUM7WUFDcEUsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLGFBQWE7WUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FDZixJQUFJLEdBQ0osSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFLLEVBQUUsR0FBSztnQkFDbkIsUUFBUSxRQUFRLFFBQVEsSUFBSTtnQkFDNUIsSUFBSSxVQUFVO29CQUNaLFNBQVMsSUFBSSxFQUFFLFFBQVEsUUFBUSxJQUFJO2dCQUNyQyxDQUFDO1lBQ0gsR0FBRyxDQUFDLE1BQVE7Z0JBQ1YsSUFBSSxVQUFVO29CQUNaLFNBQVM7Z0JBQ1gsQ0FBQztnQkFDRCxPQUFPO1lBQ1Q7UUFDSjtJQUNGO0lBRUEsV0FBMEI7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUMsT0FBTyxRQUFRLENBQUM7UUFDbkUsQ0FBQztRQUVELE1BQU0sT0FBc0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsS0FBSztRQUUxRCxPQUFPLE9BQU8sSUFBSSxPQUFPLFFBQVEsSUFBSTtJQUN2QztJQUVBOzs7O0dBSUMsR0FDRCxtQ0FBbUM7SUFDbkMsTUFBTSxRQUFtQyxFQUFpQjtRQUN4RCxPQUFPLElBQUksUUFBUSxDQUFDLFVBQVk7WUFDOUIsSUFBSSxVQUFVO2dCQUNaLFNBQVMsSUFBSTtZQUNmLENBQUM7WUFDRDtRQUNGO0lBQ0Y7SUFFQTs7OztHQUlDLEdBQ0QsWUFBa0I7SUFDaEIsT0FBTztJQUNUO0lBRUEsT0FBTyxDQUFDLE9BQU8sYUFBYSxDQUFDLEdBQWtDO1FBQzdELElBQUk7WUFDRixNQUFPLElBQUksQ0FBRTtnQkFDWCxNQUFNLFNBQXdCLE1BQU0sSUFBSSxDQUFDLElBQUk7Z0JBQzdDLElBQUksV0FBVyxJQUFJLEVBQUU7b0JBQ25CLEtBQU07Z0JBQ1IsQ0FBQztnQkFDRCxNQUFNO1lBQ1I7UUFDRixTQUFVO1lBQ1IsTUFBTSxJQUFJLENBQUMsS0FBSztRQUNsQjtJQUNGO0FBQ0YsQ0FBQyJ9