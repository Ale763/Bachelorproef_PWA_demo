// Based on https://github.com/DirtyHairy/async-mutex

class Mutex
{
    constructor()
    {
        this._queue = [];
        this._pending = false;
    }

    isLocked()
    {
        return this._pending;
    }

    acquire()
    {
        const ticket = new Promise(resolve => this._queue.push(resolve));
        
        if (!this._pending)
        {
            this._dispatchNext();
        }

        return ticket;
    }

    _dispatchNext()
    {
        if (this._queue.length > 0)
        {
            this._pending = true;
            if (this._queue.length > 0)
            {
                let next = this._queue.shift();
                if (next != null)
                    next(this._dispatchNext.bind(this));
            }

        } else
        {
            this._pending = false;
        }
    }

    _exec(task)
    {
        task().then(function ()
        {
            self._dispatchNext();
        }, function ()
            {
                self._dispatchNext();
            });
    }
}