module Guess_it exposing (..)

import Browser
import Http
import Html as H exposing (Html)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Random
import Task
import Json.Decode exposing (Decoder, map2, list, field, string)
import Html.Attributes exposing (value)
import Html.Events exposing (onInput)

-- MAIN
main =
  Browser.element
    { init = init
    , update = update
    , subscriptions = subscriptions
    , view = view
    }

-- MODEL
type Resultat
  = Failure
  | Loading
  | Success (String, List Words)


-- MODEL
type alias Model =
   { mot: String
   , donne:List String
   , sucess:Resultat
   , devine: String
   , showanswer:Bool
   }


type alias Words =
    { word : String
    , meanings : List Meaning
    }
type alias Meaning =
    { partOfSpeech : String
    , definitions : List Definition
    }
type alias Definition =
    { definition : String
    }


-- INIT
init : () -> (Model, Cmd Msg)
init _ =
  ( Model "" [] Loading "" False
  , Http.get
      { url = "http://localhost:8000/Mots/words.txt"
      , expect = Http.expectString GotText
      }
  )

-- UPDATE
type Msg
  = GotText (Result Http.Error String)
  | GotWord (Result Http.Error (List Words))
  | Num Int
  | Reload
  | Devine String
  | ShowAnswer Bool

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    GotText result ->
      case result of
        Ok fullText ->
          let
            items = String.split " " fullText
          in
          ( { model | donne = items }
          , Random.generate Num (Random.int 1 1000) )

        Err _ ->
          ({model|sucess=Failure}, Cmd.none)
    Num num ->  
      let
        mot = Maybe.withDefault "" (List.head (List.drop num model.donne))
      in
      ( { model | mot = mot }
      , Http.get
          { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ mot
          , expect = Http.expectJson GotWord descriptionDecoder
          }
      )
    GotWord result ->
        case result of
          Ok wordList ->
              ({model | sucess = Success (model.mot, wordList)}, Cmd.none)
          Err _ ->
              ({model | sucess = Failure }, Cmd.none)
    Reload ->
      init()
    Devine devine ->
        if devine == model.mot then
            ({model | devine = "Bravo, c'est gagné !!!"}, Cmd.none)
        else
            ({model | devine = devine}, Cmd.none)
    ShowAnswer showanswer ->
        ({model | showanswer = showanswer}, Cmd.none)


-- SUBSCRIPTIONS
subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

view : Model -> Html Msg
view model =
  case model.sucess of
    Failure ->
      text "I was unable to load the word or its definition."

    Loading ->
      text "Loading..."

    Success (mot, words) ->
       div [] [
         div [style "margin-left" "100px",style "data-inline" "true",style "color" "#cfa0e9",  style "font-size" "200%",style "width""100%"] [text ("Guess the word : "++(if model.showanswer then mot else " "))],
         div [style "margin-left" "100px",style "data-inline" "true"] (List.map viewWordMeaning words),
         div [style "margin-left" "100px",style "data-inline" "true",style "color" "#cfa0e9",  style "font-size" "100%",style "width""2000%"][text "Type in the word to guess"],
         input [ onInput Devine, value model.devine ,style "margin-left" "100px",style "padding" "5px 20px"] ["text" "Tap Here"],
         div [] [ button [ onClick Reload,style "data-inline" "true", style "background-color" "#cfa0e9",style "color" "Black", style "border-color" "#cfa0e9", style "font-size" "100%", style "padding" "5px 20px", style "margin-left" "100px" ] [ text "New Word" ]
                , button [onClick (ShowAnswer True),style "data-inline" "true", style "background-color" "#cfa0e9",style "color" "Black", style "border-color" "#cfa0e9", style "font-size" "100%", style "padding" "5px 20px", style "margin-left" "10px"][text "Show The Answer"]
                ]
       ]
       
viewWordMeaning : Words -> Html Msg
viewWordMeaning words =
    div []
        [
           ul [] (List.map viewMeaning words.meanings)
        ]

viewMeaning : Meaning -> Html Msg
viewMeaning meaning =
    li []
        [ text meaning.partOfSpeech        
        , ul [] (List.map viewDefinition meaning.definitions)
        ]

viewDefinition : Definition -> Html Msg
viewDefinition def =
    li [] [ text def.definition ]

-- Decoders
descriptionDecoder : Decoder (List Words)
descriptionDecoder = Json.Decode.list wordDecoder

wordDecoder : Decoder Words
wordDecoder =
    map2 Words
        (field "word" string)
        (field "meanings" (Json.Decode.list meaningDecoder))

meaningDecoder : Decoder Meaning
meaningDecoder =
    map2 Meaning
        (field "partOfSpeech" string)
        (field "definitions" (Json.Decode.list definitionDecoder))

definitionDecoder : Decoder Definition
definitionDecoder =
    Json.Decode.map Definition
        (field "definition" string)