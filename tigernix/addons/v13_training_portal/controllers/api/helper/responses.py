import json

from werkzeug.wrappers import Response

def success(
    data=None,
    params=None,
    message="Success",
    status=200
):
  return Response(
    json.dumps({
      "success": True,
      "message": message,
      "data": data,
      **(params or {})
    }),
    status=status,
    content_type="application/json"
  )


def error(
    title,
    message,
    status
):
  return Response(
    json.dumps({
      "success": False,
      "error": {
        "title": title,
        "message": message,
        "status": status,
      }
    }),
    status=status,
    content_type="application/json"
  )