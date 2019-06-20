from django.shortcuts import render
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.utils import html
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect
from pwa import settings
import html
from django.http import HttpResponse
import re
import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import urllib

FCM_PUSH_NOTIFICATION_URL = "https://fcm.googleapis.com/fcm/send"
FCM_AUTH_TOKEN = "key=AAAAx6AX0WQ:APA91bGRzt5nXLXc1E1zvDat51z-Ys0pKlV0N-Uo1WKjfuB4VAJVYDuiVSXEm1PexQ22kPT6bZcrv1EFOs4J9ebMEYRJThX6Z5kBMDfUXQfyscw7-brEsyd9x6ZEWagbsxssecBRsJwF"

# Create your views here.
@csrf_exempt
def price(request, sku):
    product = None
    with open('/data/api/products.json', 'r') as readfile:
        products_json = json.load(readfile)
        for item in products_json['products']:
            if item['sku'] == sku:
                product = item
                break

    if product is None:
        return HttpResponse("", status=404)


    cookie = get_usergroup_cookie(get_cookie(request))
    product = parse_product_price(product, cookie)
    price = product["price"]

    response = create_json_response({"price": price})
    response['Vary'] = 'application/json;'
    return response

@csrf_exempt
def product(request, sku):
    product = None
    with open('/data/api/products.json', 'r') as readfile:
        products_json = json.load(readfile)
        for item in products_json['products']:
            if item['sku'] == sku:
                product = item
                break

    if product is None:
        return HttpResponse("", status=404)

    cookie = get_usergroup_cookie(get_cookie(request))
    product = parse_product_price(product, cookie)

    response = create_json_response(product)
    response['Vary'] = 'application/json;'
    return response


@csrf_exempt
def products(request):
    with open('/data/api/products.json', 'r') as readfile:
        products_json = json.load(readfile)

    response_list = []
    cookie = get_usergroup_cookie(get_cookie(request))
    for product in products_json["products"]:
        product = parse_product_price(product, cookie)
        response_list.append(product)
    response_json = response_list

    response = create_json_response(response_json)
    response['Vary'] = 'Cookie;'
    response['x-cb'] = 'cf'
    return response


@csrf_exempt
def send_notification(request):
    if request.method != 'POST':
        return HttpResponse("", status=400)

    db = __get_db()
    token = db["firebase"]["token"]

    post_data = {
         "to" : token	,
         "collapse_key" : "type_a",
         "notification" :
         {
             "body" : "Great, we will keep you up to date",
             "title": "",
             "icon": "/images/icons/icon-72x72.png"
         },
        "data":
            {
                "cacheURL": "https://vuestorefront-demo.phpro.be/pub/media/catalog/product/w/t/wt07-green_main_1.jpg"
            }
        }

    if __send_notification(post_data):
        return  HttpResponse("Ok")
    return HttpResponse("Bad Request", status=400)


@csrf_exempt
def send_order_notification(request):
    if request.method != 'POST':
        return HttpResponse("", status=400)

    if not __check_send_push_allowed("order"):
        return  HttpResponse("Not Sent")

    db = __get_db()
    token = db["firebase"]["token"]

    post_data = {
         "to" : token	,
         "notification":
         {
             "title": "Your order has been shipped",
             "body" : "Your order will arrive today at 6 PM",
             "icon": "/images/icons/icon-72x72.png",
             "click_action":"https://pwa.local:8080/product/WT07-XS-Green",
             "tag": "order"
         },
        "data":
            {
                "cacheURL": "https://vuestorefront-demo.phpro.be/pub/media/catalog/product/w/t/wt07-green_main_1.jpg"
            }
        }

    if __send_notification(post_data):
        return  HttpResponse("Ok")
    return HttpResponse("Bad Request", status=400)


@csrf_exempt
def send_promo_notification(request):
    if request.method != 'POST':
        return HttpResponse("", status=400)

    if not __check_send_push_allowed("promo"):
        return  HttpResponse("Not Sent")

    db = __get_db()
    token = db["firebase"]["token"]

    post_data = {
         "to" : token	,
         "notification":
         {
             "title": "Be quick, there is a promotion for you!",
             "body" : "An item you are interested in is temporarily at a reduced price",
             "icon": "/images/icons/icon-72x72.png",
             "click_action":"https://pwa.local:8080/product/WT07-XS-Green",
             "tag": "promo"
         },
        "data":
            {
                "cacheURL": "https://vuestorefront-demo.phpro.be/pub/media/catalog/product/w/t/wt07-green_main_1.jpg"
            }
        }

    if __send_notification(post_data):
        return  HttpResponse("Ok")
    return HttpResponse("Bad Request", status=400)


@csrf_exempt
def send_promo_notification2(request):
    if request.method != 'POST':
        return HttpResponse("", status=400)

    if not __check_send_push_allowed("promo"):
        return  HttpResponse("Not Sent")

    db = __get_db()
    token = db["firebase"]["token"]

    post_data = {
         "to" : token	,
         "notification":
         {
             "title": "Be quick, there are only a few items left!",
             "body" : "An item you are interested in is temporarily at a reduced price",
             "icon": "/images/icons/icon-72x72.png",
             "click_action":"https://pwa.local:8080/product/WT07-XS-Green",
             "tag": "promo"
         },
        "data":
            {
                "cacheURL": "https://vuestorefront-demo.phpro.be/pub/media/catalog/product/w/t/wt07-green_main_1.jpg"
            }
        }

    if __send_notification(post_data):
        return  HttpResponse("Ok")
    return HttpResponse("Bad Request", status=400)


@csrf_exempt
def save_token(request):
    if request.method != 'POST':
        return HttpResponse("", status=400)

    my_json = request.body.decode('utf8').replace("'", '"')
    data = json.loads(my_json)

    db = __get_db()
    db["firebase"]["token"] = data["token"]
    __set_db(db)

    return HttpResponse("Ok", status=200)


@csrf_exempt
def set_mode(request):
    if request.method != 'POST':
        return HttpResponse("", status=400)

    my_json = request.body.decode('utf8').replace("'", '"')
    data = json.loads(my_json)

    db = __get_db()

    db["firebase"]["mode"] = data["mode"]

    __set_db(db)


    return HttpResponse("Ok", status=200)



@csrf_exempt
def api(request):
    
    regex = re.compile('^HTTP_')
    d = dict((regex.sub('', header), value) for (header, value)
             in request.META.items() if header.startswith('HTTP_'))
    print(d)

    last_modified_header = "IF_MODIFIED_SINCE"
    last_modified = d.get(last_modified_header)
    etag_header = "IF_NONE_MATCH"
    etag = d.get(etag_header)
    print("Last-Modified: {0}".format(last_modified))
    print("ETag: {0}".format(etag))

    # if etag == "0" or etag == "1" or etag == "2" or etag == "3" or last_modified == "Mon, 06 May 2019 06:04:50 GMT":
    #     response = HttpResponse()
    #     response['Last-Modified'] = 'Mon, 06 May 2019 06:04:50 GMT'
    #     if etag is not None:
    #         response['ETag'] = etag
    #     response.status_code = 304
    #     return response

    cookie_header = "COOKIE"
    cookie = d.get(cookie_header)

    print("Cookie: ", cookie)
    response = HttpResponse("0")
    response['Last-Modified'] = 'Mon, 06 May 2019 06:04:50 GMT'
    response['ETag'] = '0'
    if cookie == "Type=1":
        response = HttpResponse("1")
        response['ETag'] = '1'
    elif cookie == "Type=2":
        response = HttpResponse("2")
        response['ETag'] = '2'
    elif cookie == "Type=3":
        response = HttpResponse("3")
        response['ETag'] = '3'

    print("RESPONSE: ", response["ETag"])
    return response


########################################################################################################################
# Helper functions


def parse_product_price(product, cookie):
    if product is not None:
        if cookie == "User=1":
            product["price"] = { 'amt': product["price"]["group1"], 'cookie': "1"}
        elif cookie == "User=2":
            product["price"] = {'amt': product["price"]["group2"], 'cookie': "2"}
        else:
            product["price"] = {'amt': product["price"]["default"], 'cookie': "0"}
    return product


def get_cookie(request):
    regex = re.compile('^HTTP_')
    request_headers = dict((regex.sub('', header), value) for (header, value)
                           in request.META.items() if header.startswith('HTTP_'))
    # print("Request headers: {0}".format(request_headers))

    cookies = request_headers.get('COOKIE')
    if cookies is None:
        return  None
    cookies = cookies.split("; ")
    for cookie in cookies:
        if cookie.startswith('User='):
            return cookie
    return None


def get_usergroup_cookie(cookies):
    if cookies is None:
        return None
    cookies = cookies.split(";")
    for cookie in cookies:
        split_cookie = cookie.split("=")
        if split_cookie[0] == "User":
            return cookie
    return None


def create_json_response(jsondump):
    response = HttpResponse(json.dumps(jsondump))
    response['Content-Type'] = 'application/json;'
    return response


def __check_send_push_allowed(notification_type):
    db = __get_db()
    mode = db["firebase"]["mode"]
    if mode == "default":
        return True
    elif mode == "none":
        return False
    elif mode == "only_orders" and notification_type == "order":
        return True
    return False



def __get_db():
    with open('/data/api/db.json', 'r') as readfile:
        db = json.load(readfile)
    return db


def __set_db(db):
    with open('/data/api/db.json', 'w') as writefile:
        json.dump(db, writefile)


def __send_notification(body):
    post_data = json.dumps(body).encode('utf8')
    request = Request(FCM_PUSH_NOTIFICATION_URL, data=post_data)
    request.add_header("Content-Type", "application/json")
    request.add_header("Accept", "*/*")
    request.add_header("Host", "fcm.googleapis.com")
    request.add_header("Authorization", FCM_AUTH_TOKEN)

    try:
        responseJSON = urlopen(request)
        return True
    except urllib.request.HTTPError as e:
        ResponseData = e
        print(ResponseData)
    return False